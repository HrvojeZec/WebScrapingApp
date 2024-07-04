import React, { PropsWithChildren } from "react";
import { LoaderGlobal } from "../components/shared/Loader/Loader";
import { NotFoundTitle } from "../components/shared/Error/NotFoundTitle";
import {
  useProductsData,
  GetRandomProductsProvider,
} from "./GetRandomProducts";
import { GetAllKeywordsProvider, useKeywordsData } from "./GetAllKeywords";

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
    return <NotFoundTitle />;
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
