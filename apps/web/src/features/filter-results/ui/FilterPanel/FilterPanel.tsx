import { Button, Switch } from "@mantine/core";
import {
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
  type ProductsPageDto,
  type StoreDto,
} from "@storeseeker/shared";
import type { SearchIssue, SearchState } from "@/shared/lib/search-params";
import type { FilterActions } from "../../hooks/useFilters";
import { activeFilterCount, facetOptions } from "../../lib/filters";
import { FILTER_TEXT } from "../../model/constants";
import { FacetCheckboxList } from "../FacetCheckboxList/FacetCheckboxList";
import { PriceRangeInput } from "../PriceRangeInput/PriceRangeInput";
import classes from "./FilterPanel.module.scss";

type Props = {
  state: SearchState;
  /** Counts per option; undefined while the first page loads */
  facets: ProductsPageDto["facets"] | undefined;
  stores: StoreDto[];
  issues: SearchIssue[];
  actions: FilterActions;
};

/** Shops, categories, price and the discount switch; the same panel on the side and in the drawer. */
export function FilterPanel({ state, facets, stores, issues, actions }: Props) {
  const storeNames = Object.fromEntries(stores.map((store) => [store.slug, store.name]));
  const storeOptions = facetOptions(
    stores.map((store) => store.slug),
    storeNames,
    facets?.stores ?? [],
    state.store,
  );
  const categoryOptions = facetOptions(
    CATEGORY_SLUGS,
    CATEGORY_LABELS,
    facets?.categories ?? [],
    state.category,
  );

  return (
    <div className={classes.root}>
      <FacetCheckboxList
        legend={FILTER_TEXT.stores}
        options={storeOptions}
        pending={!facets}
        onToggle={actions.toggleStore}
      />
      <FacetCheckboxList
        legend={FILTER_TEXT.categories}
        options={categoryOptions}
        pending={!facets}
        onToggle={actions.toggleCategory}
      />
      <PriceRangeInput
        min={state.min}
        max={state.max}
        issue={issues.find((issue) => issue.path === "min")?.message}
        onChange={actions.setPriceRange}
      />
      <Switch
        label={FILTER_TEXT.discounted}
        checked={state.discounted}
        onChange={(event) => actions.setDiscounted(event.currentTarget.checked)}
      />
      <Button
        variant="subtle"
        className={classes.clear}
        disabled={activeFilterCount(state) === 0}
        onClick={actions.clear}
      >
        {FILTER_TEXT.clear}
      </Button>
    </div>
  );
}
