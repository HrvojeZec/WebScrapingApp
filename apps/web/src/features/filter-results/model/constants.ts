import { LIMITS } from "@storeseeker/shared";
import { formatCount } from "@/shared/lib/format";

export const FILTER_TEXT = {
  title: "Filteri",
  stores: "Trgovina",
  categories: "Kategorija",
  price: "Cijena",
  discounted: "Samo sniženo",
  clear: "Očisti filtere",
  showResults: "Prikaži rezultate",
} as const;

export const PRICE_TEXT = {
  min: "Od",
  max: "Do",
  currency: "€",
  wholeEuros: "Upiši cijeli broj eura, bez centi.",
  tooHigh: `Najviše ${formatCount(LIMITS.priceFilterMaxEuros)} eura.`,
} as const;

/** hr-HR: a dot groups thousands, a comma starts the cents (which the fields do not take). */
export const PRICE_INPUT = {
  thousandSeparator: ".",
  decimalSeparator: ",",
} as const;
