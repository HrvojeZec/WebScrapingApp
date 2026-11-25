import { Types } from "mongoose";
import {
  CATEGORY_SLUGS,
  DEMO_STORE_SLUGS,
  toSearchText,
  type CategorySlug,
} from "@storeseeker/shared";
import { discountPercent } from "../db/discount";
import type { CrawlRunFields } from "../db/models/crawl-run";
import type { PricePointFields } from "../db/models/price-point";
import type { ProductFields } from "../db/models/product";
import type { StoreFields } from "../db/models/store";
import { DEMO_CATALOG, type CatalogModel } from "./catalog";
import { createRandom } from "./random";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANDOM_SEED = 20_261_125;
const HISTORY_DAYS = 60;
const CRAWL_HOUR = 6;
const CRAWL_DURATION_MS = 60_000;
// EAN prefix 200-299 is for in-store use, so a made-up EAN never matches a real product
const EAN_PREFIX = "200";
const STORE_LETTERS = ["A", "B", "C"] as const;

export type DemoProduct = ProductFields & { _id: Types.ObjectId };

export type DemoDataset = {
  stores: StoreFields[];
  products: DemoProduct[];
  pricePoints: PricePointFields[];
  crawlRuns: CrawlRunFields[];
};

type Scenario = "steady" | "realSale" | "inflatedSale" | "delisted";
type Point = { day: number; priceCents: number; regularPriceCents: number | null };

function scenarioFor(productIndex: number): Scenario {
  if (productIndex % 10 === 0) return "realSale";
  if (productIndex % 10 === 5) return "inflatedSale";
  if (productIndex % 25 === 12) return "delisted";
  return "steady";
}

// Shop prices end in ,99
function toPrice(cents: number): number {
  return Math.max(99, Math.round(cents / 100) * 100 - 1);
}

function eanFor(modelIndex: number): string {
  const body = EAN_PREFIX + String(modelIndex + 1).padStart(9, "0");
  const sum = [...body].reduce(
    (total, digit, i) => total + Number(digit) * (i % 2 === 0 ? 1 : 3),
    0,
  );
  return body + String((10 - (sum % 10)) % 10);
}

function storesFor(modelInCategory: number, modelIndex: number): number[] {
  const all = DEMO_STORE_SLUGS.map((_, index) => index);
  const pick = modelIndex % all.length;
  // The first models of a category are in every store, the next ones in two, the rest in one
  if (modelInCategory < 2) return all;
  if (modelInCategory < 4) return all.filter((index) => index !== pick);
  return [pick];
}

function buildHistory(scenario: Scenario, basePriceCents: number, random: () => number) {
  const randomInt = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const nextChange = () => randomInt(5, 15);
  const points: Point[] = [];
  const push = (day: number, priceCents: number, regularPriceCents: number | null) => {
    const last = points.at(-1);
    // History only records changes, like saveCategoryCrawl does
    if (last?.priceCents === priceCents && last.regularPriceCents === regularPriceCents) return;
    points.push({ day, priceCents, regularPriceCents });
  };
  const base = basePriceCents * (0.97 + random() * 0.08);

  if (scenario === "realSale") {
    const saleDay = -randomInt(2, 10);
    const regular = toPrice(base);
    // Never below the regular price before the sale, so the discount is real
    for (let day = -HISTORY_DAYS; day < saleDay; day += nextChange()) {
      push(day, toPrice(regular * (1 + random() * 0.06)), null);
    }
    push(saleDay, toPrice(regular * (0.75 + random() * 0.1)), regular);
    return { points, lastSeenDay: 0 };
  }

  if (scenario === "inflatedSale") {
    const saleDay = -randomInt(2, 8);
    const raiseDay = saleDay - randomInt(3, 7);
    const low = toPrice(base * 0.95);
    const regular = toPrice(low * 1.25);
    for (let day = -HISTORY_DAYS; day < raiseDay; day += nextChange()) {
      push(day, toPrice(low * (1 + random() * 0.03)), null);
    }
    // The price goes up shortly before the sale, so the "regular" price was never really charged
    push(raiseDay, regular, null);
    push(saleDay, toPrice(low * (0.97 + random() * 0.05)), regular);
    return { points, lastSeenDay: 0 };
  }

  const lastSeenDay = scenario === "delisted" ? -randomInt(5, 12) : 0;
  for (let day = -HISTORY_DAYS; day < lastSeenDay; day += nextChange()) {
    push(day, toPrice(base * (0.92 + random() * 0.14)), null);
  }
  return { points, lastSeenDay };
}

function priceChange(points: Point[]) {
  const current = points.at(-1)!;
  for (let i = points.length - 2; i >= 0; i -= 1) {
    if (points[i]!.priceCents !== current.priceCents) {
      return { previousPriceCents: points[i]!.priceCents, changedDay: points[i + 1]!.day };
    }
  }
  return null;
}

/** The demo data, built without a database. Dates are relative to the day of `today`. */
export function buildDemoDataset(today: Date): DemoDataset {
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const crawledAt = new Date(
    midnight.getFullYear(),
    midnight.getMonth(),
    midnight.getDate(),
    CRAWL_HOUR,
  );
  const dayAt = (day: number) => new Date(midnight.getTime() + day * DAY_MS);
  const random = createRandom(RANDOM_SEED);

  const stores: StoreFields[] = DEMO_STORE_SLUGS.map((slug, index) => ({
    slug,
    name: `Demo trgovina ${STORE_LETTERS[index]}`,
    baseUrl: `https://example.com/${slug}`,
    enabled: true,
  }));

  const products: DemoProduct[] = [];
  const pricePoints: PricePointFields[] = [];

  CATEGORY_SLUGS.forEach((category, categoryIndex) => {
    DEMO_CATALOG[category].forEach((model: CatalogModel, modelInCategory) => {
      const modelIndex = categoryIndex * DEMO_CATALOG[category].length + modelInCategory;
      const ean = modelInCategory < 2 ? eanFor(modelIndex) : undefined;

      for (const storeIndex of storesFor(modelInCategory, modelIndex)) {
        const store = stores[storeIndex]!;
        const scenario = scenarioFor(products.length);
        const { points, lastSeenDay } = buildHistory(scenario, model.basePriceCents, random);
        const current = points.at(-1)!;
        const change = priceChange(points);
        const _id = new Types.ObjectId((products.length + 1).toString(16).padStart(24, "0"));
        const externalId = String(1000 + modelIndex);
        const available = scenario !== "delisted";
        const categories: CategorySlug[] = available ? [category] : [];

        products.push({
          _id,
          storeSlug: store.slug,
          externalId,
          title: model.title,
          searchText: toSearchText(model.title),
          categories,
          url: `${store.baseUrl}/p/${externalId}`,
          imageUrl: null,
          priceCents: current.priceCents,
          regularPriceCents: current.regularPriceCents,
          discountPercent: discountPercent(current.priceCents, current.regularPriceCents),
          currency: "EUR",
          available,
          ...(ean ? { ean } : {}),
          ...(change
            ? {
                previousPriceCents: change.previousPriceCents,
                priceChangedAt: dayAt(change.changedDay),
              }
            : {}),
          firstSeenAt: dayAt(points[0]!.day),
          lastSeenAt: available
            ? crawledAt
            : new Date(dayAt(lastSeenDay).getTime() + CRAWL_HOUR * 3_600_000),
        });
        for (const point of points) {
          pricePoints.push({
            productId: _id,
            priceCents: point.priceCents,
            regularPriceCents: point.regularPriceCents,
            observedAt: dayAt(point.day),
          });
        }
      }
    });
  });

  const crawlRuns: CrawlRunFields[] = stores.flatMap((store) =>
    CATEGORY_SLUGS.map((category) => ({
      storeSlug: store.slug,
      category,
      status: "ok" as const,
      pages: 1,
      products: products.filter(
        (p) => p.storeSlug === store.slug && p.categories.includes(category),
      ).length,
      error: null,
      startedAt: new Date(crawledAt.getTime() - CRAWL_DURATION_MS),
      finishedAt: crawledAt,
    })),
  );

  return { stores, products, pricePoints, crawlRuns };
}
