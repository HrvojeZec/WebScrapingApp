import { useQuery } from "@tanstack/react-query";
import type { SearchState } from "@/shared/lib/search-params";
import { productsQuery } from "../api/queries";

/** One page of the search; the previous page is shown while the next one loads. */
export const useProducts = (state: SearchState) => useQuery(productsQuery(state));
