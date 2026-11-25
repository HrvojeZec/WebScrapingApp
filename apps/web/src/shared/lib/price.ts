/** A product is on sale only when the store shows a regular price above the current one. */
export function isOnSale(priceCents: number, regularPriceCents: number | null): boolean {
  return regularPriceCents !== null && regularPriceCents > priceCents;
}
