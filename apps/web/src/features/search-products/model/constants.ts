/** Suggestions come from product names, which change only when the worker crawls */
export const SUGGESTIONS_STALE_MS = 5 * 60 * 1000;

/** The option value that clears the recent searches instead of searching */
export const CLEAR_RECENT_OPTION = "storeseeker:clear-recent";

export const SEARCH_BOX_TEXT = {
  label: "Pretraži proizvode",
  placeholder: "Pretraži proizvod, npr. televizor ili slušalice",
  submit: "Pretraži",
  recentGroup: "Nedavne pretrage",
  suggestionsGroup: "Prijedlozi",
  clearRecent: "Obriši nedavne pretrage",
} as const;
