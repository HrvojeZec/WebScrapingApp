import { LIMITS, normalizeSearchTerm } from "@storeseeker/shared";

// The complement of what searchTermSchema allows
const NOT_ALLOWED = /[^\p{L}\p{N} +\-./]+/gu;

/** A picked suggestion (a product name) as a term `searchTermSchema` accepts. */
export function suggestionToTerm(title: string): string {
  const term = normalizeSearchTerm(title.normalize("NFC").replace(NOT_ALLOWED, " "));
  if (term.length <= LIMITS.searchTermMaxLength) return term;
  const cut = term.slice(0, LIMITS.searchTermMaxLength + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (
    lastSpace > 0 ? cut.slice(0, lastSpace) : cut.slice(0, LIMITS.searchTermMaxLength)
  ).trim();
}
