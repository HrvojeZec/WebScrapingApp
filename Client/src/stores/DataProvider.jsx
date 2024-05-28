import React from "react";
import { useBrandData, BrandProvider } from "./GetBrandData";
import { LoaderGlobal } from "../components/shared/Loader/Loader";
import { NotFoundTitle } from "../components/shared/Error/NotFoundTitle";
import { useProductsData, GetAllProductsProvider } from "./GetAllProducts";
import {
  KeywordDataProvider,
  useKeywordProductDataContext,
} from "./KeywordDataProvider";

const DataProviderInner = ({ children }) => {
  const { loading: brandLoading, error: brandError } = useBrandData();
  const { loading: productsLoading, error: productsError } = useProductsData();
  const {} = useKeywordProductDataContext();
  if (brandLoading) {
    return <LoaderGlobal />;
  }
  if (brandError) {
    return <NotFoundTitle />;
  }
  return children;
};

export function DataProvider({ children }) {
  return (
    <BrandProvider>
      <GetAllProductsProvider>
        <KeywordDataProvider>
          <DataProviderInner>{children}</DataProviderInner>
        </KeywordDataProvider>
      </GetAllProductsProvider>
    </BrandProvider>
  );
}
