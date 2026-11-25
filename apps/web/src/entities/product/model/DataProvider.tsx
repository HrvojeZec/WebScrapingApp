import React, { PropsWithChildren } from "react";
import { LoaderGlobal } from "@/shared/ui/Loader/Loader";
import { NotFoundTitle } from "@/shared/ui/Error/NotFoundTitle";
import { GetRandomProductsProvider } from "./GetRandomProducts";
import { GetAllKeywordsProvider } from "./GetAllKeywords";
import { useProductsData } from "./products-context";
import { useKeywordsData } from "./keywords-context";

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
