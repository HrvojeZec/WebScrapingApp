import type { ProductDto } from "@storeseeker/shared";

type Shaped = {
  items?: unknown;
  product?: unknown;
  sameProducts?: unknown;
  similarProducts?: unknown;
};

const isProduct = (value: unknown): value is ProductDto =>
  typeof value === "object" && value !== null && "id" in value && "priceCents" in value;

// Search pages hold products, deals hold { product }, a product page holds all three lists
function productsIn(data: unknown): unknown[] {
  if (typeof data !== "object" || data === null) return [];
  const { items, product, sameProducts, similarProducts } = data as Shaped;
  const found: unknown[] = [product];
  if (Array.isArray(items)) {
    for (const item of items) found.push(isProduct(item) ? item : (item as Shaped | null)?.product);
  }
  if (Array.isArray(sameProducts)) found.push(...(sameProducts as unknown[]));
  if (Array.isArray(similarProducts)) found.push(...(similarProducts as unknown[]));
  return found;
}

/**
 * A product the app already holds from a search, the deals or another product page, so its page
 * can show the image and the name at once (and the image can fly over from the card).
 */
export function findCachedProduct(cached: unknown[], id: string): ProductDto | null {
  for (const data of cached) {
    const match = productsIn(data).find((candidate) => isProduct(candidate) && candidate.id === id);
    if (match) return match as ProductDto;
  }
  return null;
}
