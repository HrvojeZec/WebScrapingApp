import type { StoreDto } from "@storeseeker/shared";
import { API_ROUTES } from "@/shared/api/api-routes";
import { baseApi } from "@/shared/api/base-api";

// The one route that answers with a bare array
export const getStores = () => baseApi.get<StoreDto[]>(API_ROUTES.stores);
