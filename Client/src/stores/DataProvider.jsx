import React from "react";
import { LoaderGlobal } from "../components/shared/Loader/Loader";
import { NotFoundTitle } from "../components/shared/Error/NotFoundTitle";
import {
  useProductsData,
  GetRandomProductsProvider,
} from "./GetRandomProducts";
import { GetAllKeywordsProvider, useKeywordsData } from "./GetAllKeywords";

const DataProviderInner = ({ children }) => {
  const { loading: keywordsLoading, error: keywordsError } = useKeywordsData();
  const { loading: productsLoading, error: productsError } = useProductsData();

  if (productsLoading || keywordsLoading) {
    return <LoaderGlobal />;
  }
  if (productsError || keywordsError) {
    return <NotFoundTitle />;
  }
  return children;
};

export function DataProvider({ children }) {
  return (
    <GetAllKeywordsProvider>
      <GetRandomProductsProvider>
        <DataProviderInner>{children}</DataProviderInner>
      </GetRandomProductsProvider>
    </GetAllKeywordsProvider>
  );
}
