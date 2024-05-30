import React from "react";
import { useBrandData, BrandProvider } from "./GetBrandData";
import { LoaderGlobal } from "../components/shared/Loader/Loader";
import { NotFoundTitle } from "../components/shared/Error/NotFoundTitle";
import {
  useProductsData,
  GetRandomProductsProvider,
} from "./GetRandomProducts";
import { GetAllKeywordsProvider, useKeywordsData } from "./GetAllKeywords";

const DataProviderInner = ({ children }) => {
  const { loading: brandLoading, error: brandError } = useBrandData();
  const { loading: keywordsLoading, error: keywordsError } = useKeywordsData();
  const { loading: productsLoading, error: productsError } = useProductsData();

  if (brandLoading || productsLoading || keywordsLoading) {
    return <LoaderGlobal />;
  }
  if (brandError || productsError || keywordsError) {
    return <NotFoundTitle />;
  }
  return children;
};

export function DataProvider({ children }) {
  return (
    <BrandProvider>
      <GetAllKeywordsProvider>
        <GetRandomProductsProvider>
          <DataProviderInner>{children}</DataProviderInner>
        </GetRandomProductsProvider>
      </GetAllKeywordsProvider>
    </BrandProvider>
  );
}
