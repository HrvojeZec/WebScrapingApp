import { Types } from "mongoose";
import { toSearchText, type CategorySlug, type StoreSlug } from "@storeseeker/shared";
import { discountPercent } from "../db/discount";
import { PricePoint } from "../db/models/price-point";
import { Product, type ProductDocument } from "../db/models/product";
import { Store } from "../db/models/store";

export const DAY_MS = 24 * 60 * 60 * 1000;

const STORE_NAMES: Record<StoreSlug, string> = {
  harveynorman: "Harvey Norman",
  "demo-a": "Demo trgovina A",
  "demo-b": "Demo trgovina B",
  "demo-c": "Demo trgovina C",
};

export async function insertStore(slug: StoreSlug, enabled = true) {
  return Store.create({
    slug,
    name: STORE_NAMES[slug],
    baseUrl: `https://${slug}.example`,
    enabled,
  });
}

export type ProductInput = {
  title: string;
  storeSlug?: StoreSlug;
  priceCents?: number;
  regularPriceCents?: number | null;
  categories?: CategorySlug[];
  available?: boolean;
  ean?: string;
  lastSeenAt?: Date;
};

export async function insertProduct(input: ProductInput): Promise<ProductDocument> {
  const priceCents = input.priceCents ?? 10_000;
  const regularPriceCents = input.regularPriceCents ?? null;
  const seenAt = input.lastSeenAt ?? new Date("2026-11-25T06:00:00Z");
  return Product.create({
    storeSlug: input.storeSlug ?? "demo-a",
    externalId: new Types.ObjectId().toHexString(),
    title: input.title,
    searchText: toSearchText(input.title),
    categories: input.categories ?? ["mobiteli"],
    url: `https://shop.example/${encodeURIComponent(input.title)}`,
    imageUrl: null,
    priceCents,
    regularPriceCents,
    discountPercent: discountPercent(priceCents, regularPriceCents),
    currency: "EUR",
    available: input.available ?? true,
    ...(input.ean ? { ean: input.ean } : {}),
    firstSeenAt: seenAt,
    lastSeenAt: seenAt,
  });
}

export type PointInput = { daysAgo: number; priceCents: number; regularPriceCents?: number | null };

export async function insertPoints(productId: Types.ObjectId, now: Date, points: PointInput[]) {
  await PricePoint.insertMany(
    points.map((point) => ({
      productId,
      priceCents: point.priceCents,
      regularPriceCents: point.regularPriceCents ?? null,
      observedAt: new Date(now.getTime() - point.daysAgo * DAY_MS),
    })),
  );
}
