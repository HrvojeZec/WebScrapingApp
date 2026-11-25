import { describe, expect, test } from "vitest";
import { CATEGORY_SLUGS, DEMO_STORE_SLUGS } from "@storeseeker/shared";
import { discountPercent } from "../../db/discount";
import { priceInsight } from "../../db/price-insight";
import { buildDemoDataset, type DemoDataset } from "../demo-dataset";

const DAY_MS = 24 * 60 * 60 * 1000;
// Late November: no daylight saving change between these dates in any common time zone
const TODAY = new Date(2026, 10, 25);
const THREE_DAYS_LATER = new Date(2026, 10, 28);
const REAL_BRANDS = ["Apple", "Samsung", "Xiaomi", "Sony", "LG", "Lenovo", "HP"];

const dataset = buildDemoDataset(TODAY);

function pointsOf(data: DemoDataset, productId: string) {
  return data.pricePoints
    .filter((point) => point.productId.toString() === productId)
    .map((point) => ({ ...point, regularPriceCents: point.regularPriceCents ?? null }));
}

function storesBy(key: (product: DemoDataset["products"][number]) => string | null | undefined) {
  const groups = new Map<string, Set<string>>();
  for (const product of dataset.products) {
    const value = key(product);
    if (!value) continue;
    groups.set(value, (groups.get(value) ?? new Set()).add(product.storeSlug));
  }
  return [...groups.values()];
}

function allDates(data: DemoDataset): number[] {
  return [
    ...data.products.flatMap((p) => [p.firstSeenAt, p.lastSeenAt, p.priceChangedAt]),
    ...data.pricePoints.map((p) => p.observedAt),
    ...data.crawlRuns.flatMap((r) => [r.startedAt, r.finishedAt]),
  ].map((date) => (date ? date.getTime() : 0));
}

describe("buildDemoDataset", () => {
  test("is deterministic", () => {
    expect(buildDemoDataset(TODAY)).toEqual(dataset);
  });

  test("moves every date with the day it is built on, and nothing else", () => {
    const later = buildDemoDataset(THREE_DAYS_LATER);
    expect(later.products.map((p) => [p.title, p.priceCents])).toEqual(
      dataset.products.map((p) => [p.title, p.priceCents]),
    );
    expect(later.pricePoints.map((p) => p.priceCents)).toEqual(
      dataset.pricePoints.map((p) => p.priceCents),
    );
    const shifts = allDates(later).map((time, index) => time - allDates(dataset)[index]!);
    for (const [index, shift] of shifts.entries()) {
      // Products that never changed price have no priceChangedAt in either dataset
      if (allDates(dataset)[index] !== 0) expect(shift).toBe(3 * DAY_MS);
    }
  });

  test("has the three demo stores", () => {
    expect(dataset.stores.map((store) => store.slug)).toEqual([...DEMO_STORE_SLUGS]);
  });

  test("every category has at least 8 available products", () => {
    for (const category of CATEGORY_SLUGS) {
      const available = dataset.products.filter(
        (p) => p.available && p.categories.includes(category),
      );
      expect(available.length, category).toBeGreaterThanOrEqual(8);
    }
  });

  test("at least 5 models are in all 3 stores with the same EAN", () => {
    expect(
      storesBy((p) => p.ean).filter((stores) => stores.size === 3).length,
    ).toBeGreaterThanOrEqual(5);
  });

  test("at least 3 models are in 2 stores with the same title and no EAN", () => {
    const groups = storesBy((p) => (p.ean ? null : p.searchText));
    expect(groups.filter((stores) => stores.size === 2).length).toBeGreaterThanOrEqual(3);
  });

  test("has real and inflated sales", () => {
    const verdicts = dataset.products.map(
      (p) => priceInsight(pointsOf(dataset, p._id.toString()), TODAY).inflatedDiscount,
    );
    expect(verdicts.filter((v) => v === false).length).toBeGreaterThanOrEqual(4);
    expect(verdicts.filter((v) => v === true).length).toBeGreaterThanOrEqual(3);
  });

  test("has unavailable products, listed in no category", () => {
    const unavailable = dataset.products.filter((p) => !p.available);
    expect(unavailable.length).toBeGreaterThanOrEqual(2);
    for (const product of unavailable) expect(product.categories).toEqual([]);
  });

  test("every product has 60 days of ascending history that ends at its price", () => {
    for (const product of dataset.products) {
      const points = pointsOf(dataset, product._id.toString());
      const times = points.map((p) => p.observedAt.getTime());
      expect(times[0]).toBe(TODAY.getTime() - 60 * DAY_MS);
      expect(times).toEqual([...times].sort((a, b) => a - b));
      const last = points.at(-1)!;
      expect(product.priceCents).toBe(last.priceCents);
      expect(product.regularPriceCents).toBe(last.regularPriceCents);
      expect(product.discountPercent).toBe(
        discountPercent(last.priceCents, last.regularPriceCents ?? null),
      );
    }
  });

  test("uses no real brand", () => {
    for (const product of dataset.products) {
      for (const brand of REAL_BRANDS) {
        expect(product.title).not.toMatch(new RegExp(`\\b${brand}\\b`, "i"));
      }
    }
  });

  test("has a successful crawl of every category of every store this morning", () => {
    expect(dataset.crawlRuns).toHaveLength(DEMO_STORE_SLUGS.length * CATEGORY_SLUGS.length);
    for (const run of dataset.crawlRuns) {
      expect(run.status).toBe("ok");
      expect(run.finishedAt).toEqual(new Date(2026, 10, 25, 6));
    }
  });
});
