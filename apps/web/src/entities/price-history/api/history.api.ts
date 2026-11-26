import type { PriceHistoryDto } from "@storeseeker/shared";
import { API_ROUTES } from "@/shared/api/api-routes";
import { baseApi } from "@/shared/api/base-api";

export const getPriceHistory = (id: string, days: number) =>
  baseApi.get<PriceHistoryDto>(
    API_ROUTES.productHistory(id),
    new URLSearchParams({ days: String(days) }),
  );
