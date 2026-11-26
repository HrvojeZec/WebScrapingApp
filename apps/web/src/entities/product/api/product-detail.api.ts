import type { ProductDetailDto } from "@storeseeker/shared";
import { API_ROUTES } from "@/shared/api/api-routes";
import { baseApi } from "@/shared/api/base-api";

export const getProductDetail = (id: string) =>
  baseApi.get<ProductDetailDto>(API_ROUTES.product(id));
