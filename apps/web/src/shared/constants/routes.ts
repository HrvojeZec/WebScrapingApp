import { toSearchParams, type SearchState } from "@/shared/lib/search-params";

const SEARCH = "/pretraga";

/** Paths of the web app's pages. */
export const ROUTES = {
  home: "/",
  search: SEARCH,
  /** The search page for a search; default values stay out of the URL */
  searchWith: (state: Partial<SearchState>) => {
    const query = toSearchParams(state).toString();
    return query ? `${SEARCH}?${query}` : SEARCH;
  },
  product: (id: string) => `/proizvod/${encodeURIComponent(id)}`,
  /** Any path no other route matches */
  notFound: "*",
} as const;
