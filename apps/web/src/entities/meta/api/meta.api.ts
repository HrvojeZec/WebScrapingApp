import type { MetaDto } from "@storeseeker/shared";
import { API_ROUTES } from "@/shared/api/api-routes";
import { baseApi } from "@/shared/api/base-api";

export const getMeta = () => baseApi.get<MetaDto>(API_ROUTES.meta);
