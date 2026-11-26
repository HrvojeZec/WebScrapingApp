import type { FacetCount } from "@storeseeker/shared";
import type { SearchState } from "@/shared/lib/search-params";

/** What the filter panel changes; the term, the sort and the page are not filters. */
export type FilterPatch = Partial<Omit<SearchState, "page" | "sort" | "q">>;

/** A new filter shows a new result, which starts on its first page. */
export function applyFilter(state: SearchState, patch: FilterPatch): SearchState {
  return { ...state, ...patch, page: 1 };
}

export function toggleSlug<T extends string>(list: T[] | undefined, slug: T): T[] {
  const current = list ?? [];
  return current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
}

/** Every picked store and category, each price bound and the discount switch count once. */
export function activeFilterCount(state: SearchState): number {
  return (
    (state.store?.length ?? 0) +
    (state.category?.length ?? 0) +
    (state.min === undefined ? 0 : 1) +
    (state.max === undefined ? 0 : 1) +
    (state.discounted ? 1 : 0)
  );
}

// Each filter is named as undefined, since useSearchState spreads a change over the current search
export function clearFilters(state: SearchState): SearchState {
  return applyFilter(state, {
    store: undefined,
    category: undefined,
    min: undefined,
    max: undefined,
    discounted: false,
  });
}

export type FacetOption<T extends string> = {
  value: T;
  label: string;
  count: number;
  checked: boolean;
  disabled: boolean;
};

/**
 * One checkbox per value: the known values first, in their order, then any the facet or the URL
 * brings. A value with no products stays visible but cannot be picked; a picked one can always be
 * unpicked.
 */
export function facetOptions<T extends string>(
  known: readonly T[],
  labels: Partial<Record<T, string>>,
  facet: FacetCount<T>[],
  selected: T[] | undefined,
): FacetOption<T>[] {
  const picked = selected ?? [];
  const values = [...new Set([...known, ...facet.map((row) => row.value), ...picked])];
  return values.map((value) => {
    const count = facet.find((row) => row.value === value)?.count ?? 0;
    const checked = picked.includes(value);
    return {
      value,
      label: labels[value] ?? value,
      count,
      checked,
      disabled: count === 0 && !checked,
    };
  });
}
