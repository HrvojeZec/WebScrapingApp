import type { ProductDto } from "@storeseeker/shared";

/** The id of the cheapest of the same products, the first one on a tie; null for none. */
export function cheapestSame(products: ProductDto[]): string | null {
  let cheapest: ProductDto | null = null;
  for (const product of products) {
    if (!cheapest || product.priceCents < cheapest.priceCents) cheapest = product;
  }
  return cheapest?.id ?? null;
}
