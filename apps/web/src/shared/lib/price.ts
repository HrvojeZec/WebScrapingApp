/** A product is on sale only when the store shows a regular price above the current one. */
export function isOnSale(priceCents: number, regularPriceCents: number | null): boolean {
  return regularPriceCents !== null && regularPriceCents > priceCents;
}

/** The discount in whole percent as a sale tag shows it, or null when it rounds below 1 %. */
export function shownDiscount(discountPercent: number): number | null {
  const rounded = Math.round(discountPercent);
  return rounded >= 1 ? rounded : null;
}
