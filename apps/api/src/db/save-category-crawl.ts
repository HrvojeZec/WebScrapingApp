import type { AnyBulkWriteOperation, Types } from "mongoose";
import { toSearchText, type CategorySlug, type StoreSlug } from "@storeseeker/shared";
import type { ParsedProduct } from "../scraping/types";
import { discountPercent } from "./discount";
import { PricePoint, type PricePointFields } from "./models/price-point";
import { Product, type ProductFields } from "./models/product";

export type SaveCategoryCrawlInput = {
  storeSlug: StoreSlug;
  category: CategorySlug;
  products: ParsedProduct[];
  seenAt: Date;
  /** True only when the crawl reached the last page, so a missing product is really gone. */
  complete: boolean;
};

export type SaveCategoryCrawlResult = { saved: number; priceChanges: number; delisted: number };

/** Saves what one crawl of one store category listed. A blocked or failed crawl must not reach it. */
export async function saveCategoryCrawl({
  storeSlug,
  category,
  products,
  seenAt,
  complete,
}: SaveCategoryCrawlInput): Promise<SaveCategoryCrawlResult> {
  // A product can appear twice when the store shifts its list between two pages
  const seenIds = new Set<string>();
  const unique = products.filter((product) => {
    if (seenIds.has(product.externalId)) return false;
    seenIds.add(product.externalId);
    return true;
  });

  const existing = await Product.find(
    { storeSlug, externalId: { $in: [...seenIds] } },
    { externalId: 1, priceCents: 1, regularPriceCents: 1 },
  ).lean();
  const existingById = new Map(existing.map((product) => [product.externalId, product]));

  let priceChanges = 0;
  const writes: AnyBulkWriteOperation<ProductFields>[] = [];
  const pointsFor: { index: number; priceCents: number; regularPriceCents: number | null }[] = [];

  unique.forEach((product, index) => {
    const before = existingById.get(product.externalId);
    const priceChanged = before !== undefined && before.priceCents !== product.priceCents;
    const pointChanged =
      before === undefined ||
      priceChanged ||
      (before.regularPriceCents ?? null) !== product.regularPriceCents;

    const set: Partial<ProductFields> = {
      title: product.title,
      searchText: toSearchText(product.title),
      url: product.url,
      priceCents: product.priceCents,
      regularPriceCents: product.regularPriceCents,
      discountPercent: discountPercent(product.priceCents, product.regularPriceCents),
      available: product.available,
      lastSeenAt: seenAt,
    };
    // A listing without an image or EAN says nothing about them, so the saved ones stay
    if (product.imageUrl !== null) set.imageUrl = product.imageUrl;
    if (product.ean !== undefined) set.ean = product.ean;
    if (priceChanged) {
      priceChanges += 1;
      set.previousPriceCents = before.priceCents;
      set.priceChangedAt = seenAt;
    }
    if (pointChanged) {
      pointsFor.push({
        index,
        priceCents: product.priceCents,
        regularPriceCents: product.regularPriceCents,
      });
    }
    writes.push({
      updateOne: {
        filter: { storeSlug, externalId: product.externalId },
        update: {
          $set: set,
          $addToSet: { categories: category },
          $setOnInsert: { firstSeenAt: seenAt, currency: "EUR" },
        },
        upsert: true,
      },
    });
  });

  const productIds: Types.ObjectId[] = [];
  if (writes.length > 0) {
    const result = await Product.bulkWrite(writes, { ordered: true });
    unique.forEach((product, index) => {
      productIds.push(existingById.get(product.externalId)?._id ?? result.upsertedIds[index]);
    });
  }

  if (pointsFor.length > 0) {
    await PricePoint.insertMany(
      pointsFor.map(({ index, ...prices }): PricePointFields => ({
        productId: productIds[index],
        ...prices,
        observedAt: seenAt,
      })),
    );
  }

  // An empty listing is far more likely broken markup than a sold-out category
  const delisted =
    complete && unique.length > 0 ? await dropUnseen(storeSlug, category, [...seenIds]) : 0;
  return { saved: unique.length, priceChanges, delisted };
}

// A product the store no longer lists in this category loses it; with no category left it is gone
async function dropUnseen(
  storeSlug: StoreSlug,
  category: CategorySlug,
  seenIds: string[],
): Promise<number> {
  const unseen = await Product.find(
    { storeSlug, categories: category, externalId: { $nin: seenIds } },
    { _id: 1 },
  ).lean();
  if (unseen.length === 0) return 0;

  const ids = unseen.map((product) => product._id);
  await Product.updateMany({ _id: { $in: ids } }, { $pull: { categories: category } });
  const result = await Product.updateMany(
    { _id: { $in: ids }, categories: { $size: 0 } },
    { $set: { available: false } },
  );
  return result.matchedCount;
}
