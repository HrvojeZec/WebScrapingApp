import { queryOptions } from "@tanstack/react-query";
import { STORES_STALE_MS } from "../model/constants";
import { getStores } from "./stores.api";
import { storeKeys } from "./query-keys";

export const storesQuery = () =>
  queryOptions({ queryKey: storeKeys.all, queryFn: getStores, staleTime: STORES_STALE_MS });
