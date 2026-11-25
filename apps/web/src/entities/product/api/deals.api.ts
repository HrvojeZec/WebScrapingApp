import type { DealsDto } from "@storeseeker/shared";
import { API_ROUTES } from "@/shared/api/api-routes";
import { baseApi } from "@/shared/api/base-api";

export const getDeals = (limit: number) =>
  baseApi.get<DealsDto>(API_ROUTES.deals, new URLSearchParams({ limit: String(limit) }));
