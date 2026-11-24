import type { AnyBulkWriteOperation, Types } from "mongoose";
import type { StoreSlug } from "@storeseeker/shared";
import type { ParsedProduct } from "../scraping/types";
import { discountPercent } from "./discount";
import { KeywordResult, type KeywordResultFields } from "./models/keyword-result";
import { PricePoint, type PricePointFields } from "./models/price-point";
import { Product, type ProductFields } from "./models/product";

export type SaveStoreResultsInput = {
  storeSlug: StoreSlug;
  /** Already normalized with normalizeKeyword. */
  keyword: string;
  /** In the order the store listed them; the position becomes the rank. */
  products: ParsedProduct[];
  seenAt: Date;
};

/**
 * Saves one store's search results for a keyword. Call it only for an "ok" or "empty" run:
 * an empty list removes the store's links for the keyword, so a blocked or failed run must not
 * reach it.
 */
export async function saveStoreResults({
  storeSlug,
  keyword,
  products,
  seenAt,
}: SaveStoreResultsInput): Promise<{ saved: number; priceChanges: number }> {
  // A product can appear twice when the store shifts its list between two pages
  const seenIds = new Set<string>();
  const unique = products.filter((product) => {
    if (seenIds.has(product.externalId)) return false;
    seenIds.add(product.externalId);
    return true;
  });

  const existing = await Product.find(
    { storeSlug, externalId: { $in: unique.map((product) => product.externalId) } },
    { externalId: 1, priceCents: 1, regularPriceCents: 1 },
  ).lean();
  const existingById = new Map(existing.map((product) => [product.externalId, product]));

  let priceChanges = 0;
  const writes: AnyBulkWriteOperation<ProductFields>[] = [];
  const pointsFor: { index: number; priceCents: number; regularPriceCents: number | null }[] = [];

  unique.forEach((product, index) => {
    const before = existingById.get(product.externalId);
    const fields = {
      title: product.title,
      url: product.url,
      imageUrl: product.imageUrl,
      priceCents: product.priceCents,
      regularPriceCents: product.regularPriceCents,
      discountPercent: discountPercent(product.priceCents, product.regularPriceCents),
      available: product.available,
      lastSeenAt: seenAt,
    };
    const priceChanged = before !== undefined && before.priceCents !== product.priceCents;
    const pointChanged =
      before === undefined ||
      priceChanged ||
      (before.regularPriceCents ?? null) !== product.regularPriceCents;

    if (priceChanged) priceChanges += 1;
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
          $set: priceChanged
            ? { ...fields, previousPriceCents: before.priceCents, priceChangedAt: seenAt }
            : fields,
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
      const id = existingById.get(product.externalId)?._id ?? result.upsertedIds[index];
      productIds.push(id);
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

  const links: AnyBulkWriteOperation<KeywordResultFields>[] = productIds.map(
    (productId, index) => ({
      updateOne: {
        filter: { keyword, productId },
        update: { $set: { storeSlug, rank: index + 1, seenAt } },
        upsert: true,
      },
    }),
  );
  if (links.length > 0) await KeywordResult.bulkWrite(links);
  // Products the store no longer lists for this keyword stop showing up for it, but keep their history
  await KeywordResult.deleteMany({ keyword, storeSlug, seenAt: { $lt: seenAt } });

  return { saved: unique.length, priceChanges };
}
