import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { SearchState } from "@/shared/lib/search-params";
import { PRODUCTS_STALE_MS } from "../model/constants";
import { getDeals } from "./deals.api";
import { getProducts } from "./products.api";
import { productKeys } from "./query-keys";

// The old page stays on screen while the next one loads, so sorting never blanks the grid
export const productsQuery = (state: SearchState) =>
  queryOptions({
    queryKey: productKeys.list(state),
    queryFn: () => getProducts(state),
    staleTime: PRODUCTS_STALE_MS,
    placeholderData: keepPreviousData,
  });

export const dealsQuery = (limit: number) =>
  queryOptions({
    queryKey: productKeys.deals(limit),
    queryFn: () => getDeals(limit),
    staleTime: PRODUCTS_STALE_MS,
  });
