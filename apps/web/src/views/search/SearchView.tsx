import { Button, Container } from "@mantine/core";
import { useSearchParams } from "react-router";
import { LIMITS } from "@storeseeker/shared";
import { useProducts } from "@/entities/product/hooks/useProducts";
import { storeFreshness } from "@/entities/store/lib/freshness";
import { useStores } from "@/entities/store/hooks/useStores";
import { refreshCategories } from "@/features/refresh-prices/lib/refresh-categories";
import { RefreshPrices } from "@/features/refresh-prices/ui/RefreshPrices/RefreshPrices";
import { SortMenu } from "@/features/sort-results/ui/SortMenu/SortMenu";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useSearchState } from "@/shared/hooks/useSearchState";
import { countText, PRODUCT_FORMS } from "@/shared/lib/plural";
import { searchTermAsTyped } from "@/shared/lib/search-params";
import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState/ErrorState";
import { ProductGrid } from "@/widgets/product-grid/ui/ProductGrid/ProductGrid";
import { searchHeading } from "./lib/search-heading";
import { SEARCH_TEXT } from "./model/constants";
import { EmptyResults } from "./ui/EmptyResults/EmptyResults";
import { SearchHeader } from "./ui/SearchHeader/SearchHeader";
import { StoreFreshness } from "./ui/StoreFreshness/StoreFreshness";
import classes from "./SearchView.module.scss";

/** The results of a search; everything it shows comes from the URL. */
export function SearchView() {
  const [state, , setState] = useSearchState();
  const [params] = useSearchParams();
  const term = searchTermAsTyped(params);
  const products = useProducts(state);
  const stores = useStores();
  useDocumentTitle(term ?? SEARCH_TEXT.documentTitle);

  const data = products.data;
  const filtered = Boolean(
    state.store?.length ||
    (term && state.category?.length) ||
    state.min !== undefined ||
    state.max !== undefined ||
    state.discounted,
  );

  let content;
  if (products.isError) {
    content = <ErrorState error={products.error} onRetry={() => void products.refetch()} />;
  } else if (!data) {
    content = (
      <ProductGrid
        items={[]}
        total={0}
        page={state.page}
        pageSize={LIMITS.pageSizeDefault}
        onPageChange={() => undefined}
        loading
      />
    );
  } else if (data.total === 0) {
    content = (
      <EmptyResults
        term={term}
        filtered={filtered}
        onClearFilters={() =>
          setState({
            category: term ? [] : state.category,
            store: [],
            min: undefined,
            max: undefined,
            discounted: false,
          })
        }
      />
    );
  } else if (data.items.length === 0) {
    content = (
      <EmptyState
        title={SEARCH_TEXT.pastLastPageTitle}
        action={
          <Button variant="outline" onClick={() => setState({ page: 1 })}>
            {SEARCH_TEXT.firstPage}
          </Button>
        }
      >
        {SEARCH_TEXT.pastLastPage}
      </EmptyState>
    );
  } else {
    content = (
      <ProductGrid
        items={data.items}
        total={data.total}
        page={data.page}
        pageSize={data.pageSize}
        onPageChange={(page) => setState({ page })}
        busy={products.isPlaceholderData}
      />
    );
  }

  return (
    <Container className={classes.page}>
      <SearchHeader
        heading={searchHeading({ term, category: state.category, discounted: state.discounted })}
        count={data ? countText(data.total, PRODUCT_FORMS) : null}
        freshness={<StoreFreshness lines={storeFreshness(stores.data ?? [])} />}
        refresh={
          <RefreshPrices
            // A new search starts with no refresh status of the previous one
            key={`${state.q ?? ""}|${state.category?.join(",") ?? ""}`}
            categories={refreshCategories(state.category, data?.facets.categories ?? [])}
          />
        }
        sort={<SortMenu value={state.sort} onChange={(sort) => setState({ sort })} />}
      />
      {content}
    </Container>
  );
}
