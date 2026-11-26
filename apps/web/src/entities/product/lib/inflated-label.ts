/** What the sale really is, from the insight's `inflatedDiscount`; null when there is no sale. */
export function inflatedLabel(inflated: boolean | null): string | null {
  if (inflated === null) return null;
  return inflated ? "Sniženje u odnosu na napuhanu cijenu" : "Stvarno sniženje";
}
