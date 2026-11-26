import type { ProductDto } from "@storeseeker/shared";

/**
 * The id of the cheapest of the same products that can be bought, the first one on a tie; null
 * when none can. A "lowest price" on a product nobody can buy would mislead.
 */
export function cheapestSame(products: ProductDto[]): string | null {
  let cheapest: ProductDto | null = null;
  for (const product of products) {
    if (!product.available) continue;
    if (!cheapest || product.priceCents < cheapest.priceCents) cheapest = product;
  }
  return cheapest?.id ?? null;
}
