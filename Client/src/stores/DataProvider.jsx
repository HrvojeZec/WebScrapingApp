import React from "react";
import { useBrandData, BrandProvider } from "./GetBrandData";
import { LoaderGlobal } from "../components/shared/Loader/Loader";
import { NotFoundTitle } from "../components/shared/Error/Error";
import { useProductsData, GetAllProductsProvider } from "./GetAllProducts";
const DataProviderInner = ({ children }) => {
  const { loading: brandLoading, error: brandError } = useBrandData();
  const { loading: productsLoading, error: productsError } = useProductsData();
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
      <GetAllProductsProvider>
        <DataProviderInner>{children}</DataProviderInner>
      </GetAllProductsProvider>
    </BrandProvider>
  );
}
