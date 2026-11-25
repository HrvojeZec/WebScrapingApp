import { CATEGORY_LABELS, type CategorySlug } from "@storeseeker/shared";
import { SEARCH_TEXT } from "../model/constants";

type HeadingInput = { term?: string; category?: CategorySlug[]; discounted: boolean };

// "A, b i c"; Intl.ListFormat would do it, but the TS lib of the web is ES2020
function joinLabels(labels: string[]): string {
  const [first, ...rest] = labels.map((label, index) =>
    index === 0 ? label : label.toLocaleLowerCase("hr"),
  );
  if (rest.length === 0) return first;
  const last = rest.pop();
  return `${[first, ...rest].join(", ")} i ${last}`;
}

/** The h1 of the results: the term in Croatian quotes, else the categories, else what is shown. */
export function searchHeading({ term, category, discounted }: HeadingInput): string {
  if (term) return `„${term}“`;
  if (category && category.length > 0) {
    return joinLabels(category.map((slug) => CATEGORY_LABELS[slug]));
  }
  return discounted ? SEARCH_TEXT.onSale : SEARCH_TEXT.allProducts;
}
