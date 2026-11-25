import { useQuery } from "@tanstack/react-query";
import { dealsQuery } from "../api/queries";
import { DEALS_HOME_LIMIT } from "../model/constants";

/** The biggest discounts, real sales before inflated ones. */
export const useDeals = (limit = DEALS_HOME_LIMIT) => useQuery(dealsQuery(limit));
