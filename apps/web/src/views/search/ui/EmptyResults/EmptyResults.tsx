import { Button } from "@mantine/core";
import { Link } from "react-router";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@storeseeker/shared";
import { useSuggestions } from "@/features/search-products/hooks/useSuggestions";
import { suggestionToTerm } from "@/features/search-products/lib/suggestion-term";
import { ROUTES } from "@/shared/constants/routes";
import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";
import { SEARCH_TEXT } from "../../model/constants";
import classes from "./EmptyResults.module.scss";

type Props = {
  /** The term as typed, if there is one */
  term?: string;
  /** Filters other than the term are on */
  filtered: boolean;
  onClearFilters: () => void;
};

/** No products for this search, and where to go instead. */
export function EmptyResults({ term, filtered, onClearFilters }: Props) {
  const suggestions = useSuggestions(term ?? "");

  let text: string = SEARCH_TEXT.emptyDatabase;
  if (filtered) text = SEARCH_TEXT.noResultsFiltered;
  else if (term) text = `Za „${term}“ nema proizvoda. ${SEARCH_TEXT.noResultsTip}`;

  return (
    <EmptyState
      title={SEARCH_TEXT.noResultsTitle}
      action={
        filtered ? (
          <Button variant="outline" onClick={onClearFilters}>
            {SEARCH_TEXT.clearFilters}
          </Button>
        ) : (
          <div className={classes.links}>
            <span className={classes.label}>
              {suggestions.length > 0 ? SEARCH_TEXT.suggestions : SEARCH_TEXT.categories}
            </span>
            <ul className={classes.list}>
              {suggestions.length > 0
                ? suggestions.map((name) => (
                    <li key={name}>
                      <Link to={ROUTES.searchWith({ q: suggestionToTerm(name) })}>{name}</Link>
                    </li>
                  ))
                : CATEGORY_SLUGS.map((slug) => (
                    <li key={slug}>
                      <Link to={ROUTES.searchWith({ category: [slug] })}>
                        {CATEGORY_LABELS[slug]}
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>
        )
      }
    >
      {text}
    </EmptyState>
  );
}
