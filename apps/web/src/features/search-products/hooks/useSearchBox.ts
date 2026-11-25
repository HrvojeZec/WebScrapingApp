import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import type { ComboboxData } from "@mantine/core";
import { searchTermSchema } from "@storeseeker/shared";
import { ROUTES } from "@/shared/constants/routes";
import { suggestionToTerm } from "../lib/suggestion-term";
import { CLEAR_RECENT_OPTION, SEARCH_BOX_TEXT } from "../model/constants";
import { useRecentSearches } from "./useRecentSearches";
import { useSuggestions } from "./useSuggestions";

/** State of a search box: the term, its validation error, the dropdown and the search itself. */
export function useSearchBox() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const urlTerm = pathname === ROUTES.search ? (searchParams.get("q") ?? "") : "";

  const [value, setValueState] = useState(urlTerm);
  const [error, setError] = useState<string | null>(null);
  // Follows the URL (back button, a link to another search) without an effect
  const [shownUrlTerm, setShownUrlTerm] = useState(urlTerm);
  if (urlTerm !== shownUrlTerm) {
    setShownUrlTerm(urlTerm);
    setValueState(urlTerm);
    setError(null);
  }

  const recent = useRecentSearches();
  const suggestions = useSuggestions(value);

  const search = (term: string) => {
    const parsed = searchTermSchema.safeParse(term);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? null);
      return;
    }
    setError(null);
    recent.add(parsed.data);
    navigate(`${ROUTES.search}?${new URLSearchParams({ q: parsed.data })}`);
  };

  const setValue = (next: string) => {
    // Autocomplete reports the picked option as a change too; the clear option is no term
    if (next === CLEAR_RECENT_OPTION) return;
    setValueState(next);
    setError(null);
  };

  const pickOption = (option: string) => {
    if (option === CLEAR_RECENT_OPTION) {
      recent.clear();
      return;
    }
    // A suggestion is a product name; a recent search is a term already
    search(suggestionToTerm(option));
  };

  let options: ComboboxData = [];
  if (value.trim() === "" && recent.terms.length > 0) {
    options = [
      { group: SEARCH_BOX_TEXT.recentGroup, items: [...recent.terms, CLEAR_RECENT_OPTION] },
    ];
  } else if (suggestions.length > 0) {
    options = [{ group: SEARCH_BOX_TEXT.suggestionsGroup, items: suggestions }];
  }

  return { value, setValue, error, options, submit: () => search(value), pickOption };
}
