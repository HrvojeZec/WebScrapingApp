// Croatian format: "." or a space groups thousands, "," starts the cents, "€" follows the amount.
// Only euro amounts count, so a leftover kuna price ("9.788,27 kn") is never read as euros.
const EURO_AMOUNT = /(\d{1,3}(?:[. ]\d{3})+|\d+)(?:,(\d{1,2}))?\s*€/;

export function parsePriceCents(text: string): number | null {
  // Shops use no-break spaces (U+00A0, U+202F) as thousands separators
  const match = EURO_AMOUNT.exec(text.replace(/\s/g, " "));
  if (!match) return null;
  const euros = Number(match[1].replace(/[. ]/g, ""));
  const cents = Number((match[2] ?? "0").padEnd(2, "0"));
  const total = euros * 100 + cents;
  return total > 0 ? total : null;
}
