/** Limits that only the web needs; shared limits live in `LIMITS` from @storeseeker/shared. */
export const WEB_LIMITS = {
  /** How many recent searches the search box remembers */
  recentSearchesMax: 5,
  /** Pause after the last keystroke before suggestions are fetched */
  suggestionsDebounceMs: 200,
  /** Repeats of a query after a network failure or a 5xx; a 4xx is never repeated */
  queryRetries: 2,
} as const;
