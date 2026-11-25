import { useDebouncedValue } from "@mantine/hooks";
import { normalizeSearchTerm, searchTermSchema } from "@storeseeker/shared";
import { useProductSuggestions } from "@/entities/product/hooks/useProductSuggestions";
import { WEB_LIMITS } from "@/shared/constants/limits";

/** Product names for what the user is typing, once the term would pass the API's validation. */
export function useSuggestions(term: string): string[] {
  const [debounced] = useDebouncedValue(
    normalizeSearchTerm(term),
    WEB_LIMITS.suggestionsDebounceMs,
  );
  // The schema also enforces LIMITS.searchTermMinLength, so short terms never reach the API
  const valid = searchTermSchema.safeParse(debounced).success;
  const { data } = useProductSuggestions(debounced, valid);
  return valid ? (data?.suggestions ?? []) : [];
}
