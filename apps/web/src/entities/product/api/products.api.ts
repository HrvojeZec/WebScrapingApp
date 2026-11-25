import type { ProductsPageDto } from "@storeseeker/shared";
import { API_ROUTES } from "@/shared/api/api-routes";
import { baseApi } from "@/shared/api/base-api";
import { toSearchParams, type SearchState } from "@/shared/lib/search-params";

export const getProducts = (state: SearchState) =>
  baseApi.get<ProductsPageDto>(API_ROUTES.products, toSearchParams(state));
