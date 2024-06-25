import React from "react";
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

const DataProviderInner = ({children} :Props) => {
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

export function DataProvider({children} :Props) {
  return (
    <GetAllKeywordsProvider>
      <GetRandomProductsProvider>
        <DataProviderInner>{children}</DataProviderInner>
      </GetRandomProductsProvider>
    </GetAllKeywordsProvider>
  );
}
