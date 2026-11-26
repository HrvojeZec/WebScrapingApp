import { useMemo } from "react";
import { useSearchParams } from "react-router";
import {
  parseSearchParams,
  toSearchParams,
  type SearchIssue,
  type SearchState,
} from "@/shared/lib/search-params";

type SetSearchState = (next: Partial<SearchState>) => void;

/**
 * The search of the page, read from the URL, and the only way to change it. Any change but the
 * page goes back to page 1; each change is a history entry, so the back button undoes it.
 */
export function useSearchState(): [SearchState, SearchIssue[], SetSearchState] {
  const [params, setParams] = useSearchParams();
  const { state, issues } = useMemo(() => parseSearchParams(params), [params]);

  const setState: SetSearchState = (next) => {
    const merged: SearchState = { ...state, page: 1, ...next };
    const nextParams = toSearchParams(merged);
    // The heading shows the term as typed; the parsed one is lowercased
    const typed = params.get("q");
    if (merged.q === state.q && typed !== null && merged.q !== undefined)
      nextParams.set("q", typed);
    // ScrollRestoration scrolls to the top on a new page of results only (finding L6)
    setParams(nextParams, { preventScrollReset: merged.page === state.page });
  };

  return [state, issues, setState];
}
