import React from "react";
import { useBrandData, BrandProvider } from "./GetBrandData";
import { LoaderGlobal } from "../components/shared/Loader/Loader";
import { NotFoundTitle } from "../components/shared/Error/Error";

const DataProviderInner = ({ children }) => {
  const { loading: brandLoading, error: brandError } = useBrandData();
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
      <DataProviderInner>{children}</DataProviderInner>
    </BrandProvider>
  );
}
