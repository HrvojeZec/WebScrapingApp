import { useCallback, useState } from "react";
import { WEB_LIMITS } from "@/shared/constants/limits";
import { addRecentSearch, readRecentSearches, writeRecentSearches } from "../lib/recent-searches";

/** The last searches on this device, newest first. */
export function useRecentSearches() {
  const [terms, setTerms] = useState(readRecentSearches);

  const add = useCallback((term: string) => {
    setTerms((current) => {
      const next = addRecentSearch(current, term, WEB_LIMITS.recentSearchesMax);
      writeRecentSearches(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeRecentSearches([]);
    setTerms([]);
  }, []);

  return { terms, add, clear };
}
