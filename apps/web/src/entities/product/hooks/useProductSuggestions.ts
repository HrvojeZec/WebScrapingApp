import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { suggestionsQuery } from "../api/queries";

/** Product names that match `term`; asks the API only while `enabled`. */
export const useProductSuggestions = (term: string, enabled: boolean) =>
  useQuery({ ...suggestionsQuery(term), enabled, placeholderData: keepPreviousData });
