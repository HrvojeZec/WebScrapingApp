import type { SearchState } from "@/shared/lib/search-params";

export const productKeys = {
  all: ["products"] as const,
  list: (state: SearchState) => [...productKeys.all, "list", state] as const,
  deals: (limit: number) => [...productKeys.all, "deals", limit] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
  suggestions: (term: string) => [...productKeys.all, "suggestions", term] as const,
};
