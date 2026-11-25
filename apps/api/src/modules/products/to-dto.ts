import type { CategorySlug, ProductDto, StoreSlug } from "@storeseeker/shared";
import type { Types } from "mongoose";
import type { ProductFields } from "../../db/models/product";

export type LeanProduct = ProductFields & { _id: Types.ObjectId };

/** storeNames: the enabled stores; a product is only ever shown for one of them. */
export function toProductDto(product: LeanProduct, storeNames: Map<string, string>): ProductDto {
  return {
    id: product._id.toHexString(),
    storeSlug: product.storeSlug as StoreSlug,
    storeName: storeNames.get(product.storeSlug) ?? product.storeSlug,
    title: product.title,
    url: product.url,
    imageUrl: product.imageUrl ?? null,
    priceCents: product.priceCents,
    regularPriceCents: product.regularPriceCents ?? null,
    discountPercent: product.discountPercent,
    currency: "EUR",
    available: product.available,
    categories: product.categories as CategorySlug[],
    lastSeenAt: product.lastSeenAt.toISOString(),
  };
}
