import { queryOptions } from "@tanstack/react-query";
import { HISTORY_STALE_MS } from "../model/constants";
import { getPriceHistory } from "./history.api";
import { priceHistoryKeys } from "./query-keys";

export const priceHistoryQuery = (id: string, days: number) =>
  queryOptions({
    queryKey: priceHistoryKeys.product(id, days),
    queryFn: () => getPriceHistory(id, days),
    staleTime: HISTORY_STALE_MS,
  });
