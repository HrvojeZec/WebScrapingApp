import { toSearchParams, type SearchState } from "@/shared/lib/search-params";

const SEARCH = "/pretraga";
const PRODUCT = "/proizvod";

/** Paths of the web app's pages. */
export const ROUTES = {
  home: "/",
  search: SEARCH,
  /** The search page for a search; default values stay out of the URL */
  searchWith: (state: Partial<SearchState>) => {
    const query = toSearchParams(state).toString();
    return query ? `${SEARCH}?${query}` : SEARCH;
  },
  product: (id: string) => `${PRODUCT}/${encodeURIComponent(id)}`,
  /** The route pattern of `product`, for the router */
  productPattern: `${PRODUCT}/:id`,
  /** Any path no other route matches */
  notFound: "*",
} as const;
