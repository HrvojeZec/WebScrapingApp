import { useQuery } from "@tanstack/react-query";
import { LIMITS } from "@storeseeker/shared";
import { priceHistoryQuery } from "../api/queries";

/** The stored prices of a product over the last `days` days, oldest first. */
export const usePriceHistory = (id: string, days: number = LIMITS.historyDaysDefault) =>
  useQuery(priceHistoryQuery(id, days));
