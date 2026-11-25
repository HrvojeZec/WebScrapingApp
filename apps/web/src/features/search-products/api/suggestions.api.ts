import type { SuggestionsDto } from "@storeseeker/shared";
import { API_ROUTES } from "@/shared/api/api-routes";
import { baseApi } from "@/shared/api/base-api";

export const getSuggestions = (term: string) =>
  baseApi.get<SuggestionsDto>(API_ROUTES.suggestions, new URLSearchParams({ q: term }));
