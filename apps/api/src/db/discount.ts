export function discountPercent(priceCents: number, regularPriceCents: number | null): number {
  if (regularPriceCents === null || regularPriceCents <= priceCents) return 0;
  // Rounded down, so a discount is never shown bigger than it is
  return Math.floor((100 * (regularPriceCents - priceCents)) / regularPriceCents);
}
