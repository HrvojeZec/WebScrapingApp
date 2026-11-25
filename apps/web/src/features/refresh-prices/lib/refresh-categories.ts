import { CATEGORY_SLUGS, type CategorySlug, type FacetCount } from "@storeseeker/shared";

/**
 * The categories a refresh asks the worker for: the ones the user filtered by, else the ones the
 * results come from, else all of them. A search term alone cannot be crawled (robots.txt of the
 * shops forbids their search pages), so the refresh crawls whole categories.
 */
export function refreshCategories(
  filter: CategorySlug[] | undefined,
  facets: FacetCount<CategorySlug>[],
): CategorySlug[] {
  if (filter && filter.length > 0) return filter;
  const found = facets.filter((facet) => facet.count > 0).map((facet) => facet.value);
  return found.length > 0 ? found : [...CATEGORY_SLUGS];
}
