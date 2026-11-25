import React, { PropsWithChildren } from "react";
import { LoaderGlobal } from "@/shared/ui/Loader/Loader";
import { Container } from "@mantine/core";
import { ApiError } from "@/shared/api/base-api";
import { ErrorState } from "@/shared/ui/ErrorState/ErrorState";
import { GetRandomProductsProvider } from "./GetRandomProducts";
import { GetAllKeywordsProvider } from "./GetAllKeywords";
import { useProductsData } from "./products-context";
import { useKeywordsData } from "./keywords-context";

// The old fetches fail only when the response is no JSON or there is none: the API is down
const LEGACY_FETCH_ERROR = new ApiError("unavailable", "Legacy fetch failed", null);

interface Props {
  children: React.ReactNode;
}

const DataProviderInner = (props: PropsWithChildren<Props>) => {
  const { loading: keywordsLoading, error: keywordsError } = useKeywordsData();
  const { loading: productsLoading, error: productsError } = useProductsData();

  if (productsLoading || keywordsLoading) {
    return <LoaderGlobal />;
  }
  if (productsError || keywordsError) {
    return (
      <Container>
        <ErrorState error={LEGACY_FETCH_ERROR} titleOrder={1} />
      </Container>
    );
  }
  return props.children;
};

export function DataProvider(props: PropsWithChildren<Props>) {
  return (
    <GetAllKeywordsProvider>
      <GetRandomProductsProvider>
        <DataProviderInner>{props.children}</DataProviderInner>
      </GetRandomProductsProvider>
    </GetAllKeywordsProvider>
  );
}
