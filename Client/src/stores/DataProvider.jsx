import React from "react";
import { useBrandData, BrandProvider } from "./GetBrandData";
import { LoaderGlobal } from "../components/shared/Loader/Loader";
import { NotFoundTitle } from "../components/shared/Error/NotFoundTitle";
import {
  useProductsData,
  GetRandomProductsProvider,
} from "./GetRandomProducts";
import {
  KeywordDataProvider,
  useKeywordProductDataContext,
} from "./KeywordDataProvider";

const DataProviderInner = ({ children }) => {
  const { loading: brandLoading, error: brandError } = useBrandData();
  const { loading: productsLoading, error: productsError } = useProductsData();
  /*   const {} = useKeywordProductDataContext(); */
  if (brandLoading || productsLoading) {
    return <LoaderGlobal />;
  }
  if (brandError || productsError) {
    return <NotFoundTitle />;
  }
  return children;
};

export function DataProvider({ children }) {
  return (
    <BrandProvider>
      <GetRandomProductsProvider>
        {/*       <KeywordDataProvider> */}
        <DataProviderInner>{children}</DataProviderInner>
        {/*         </KeywordDataProvider> */}
      </GetRandomProductsProvider>
    </BrandProvider>
  );
}
