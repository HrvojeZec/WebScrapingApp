import { queryOptions } from "@tanstack/react-query";
import { SUGGESTIONS_STALE_MS } from "../model/constants";
import { suggestionKeys } from "./query-keys";
import { getSuggestions } from "./suggestions.api";

export const suggestionsQuery = (term: string) =>
  queryOptions({
    queryKey: suggestionKeys.term(term),
    queryFn: () => getSuggestions(term),
    staleTime: SUGGESTIONS_STALE_MS,
  });
