import type { CategorySlug, StoreSlug } from "@storeseeker/shared";
import { useSearchState } from "@/shared/hooks/useSearchState";
import type { SearchIssue, SearchState } from "@/shared/lib/search-params";
import { activeFilterCount, applyFilter, clearFilters, toggleSlug } from "../lib/filters";

export type FilterActions = {
  toggleStore: (store: StoreSlug) => void;
  toggleCategory: (category: CategorySlug) => void;
  setPriceRange: (min: number | undefined, max: number | undefined) => void;
  setDiscounted: (discounted: boolean) => void;
  clear: () => void;
};

export type Filters = FilterActions & {
  state: SearchState;
  issues: SearchIssue[];
  activeCount: number;
};

/** The filters of the search in the URL; each change is a history entry and goes to page 1. */
export function useFilters(): Filters {
  const [state, issues, setState] = useSearchState();

  return {
    state,
    issues,
    activeCount: activeFilterCount(state),
    toggleStore: (store) => setState(applyFilter(state, { store: toggleSlug(state.store, store) })),
    toggleCategory: (category) =>
      setState(applyFilter(state, { category: toggleSlug(state.category, category) })),
    setPriceRange: (min, max) => setState(applyFilter(state, { min, max })),
    setDiscounted: (discounted) => setState(applyFilter(state, { discounted })),
    clear: () => setState(clearFilters(state)),
  };
}
