import React from "react";
import { useBrandData, BrandProvider } from "./GetBrandData";
import { LoaderGlobal } from "../components/shared/Loader/Loader";
import { NotFoundTitle } from "../components/shared/Error/NotFoundTitle";
import {
  useProductsData,
  GetRandomProductsProvider,
} from "./GetRandomProducts";
import { GetAllKeywordsProvider, useKeywordsData } from "./GetAllKeywords";
import {
  KeywordDataProvider,
  useKeywordProductDataContext,
} from "./KeywordDataProvider";

const DataProviderInner = ({ children }) => {
  const { loading: brandLoading, error: brandError } = useBrandData();
  const { loading: keywordsLoading, error: keywordsError } = useKeywordsData();
  const { loading: productsLoading, error: productsError } = useProductsData();

  /*   const {} = useKeywordProductDataContext(); */
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
          {/*       <KeywordDataProvider> */}
          <DataProviderInner>{children}</DataProviderInner>
          {/*         </KeywordDataProvider> */}
        </GetRandomProductsProvider>
      </GetAllKeywordsProvider>
    </BrandProvider>
  );
}
