import React from "react";
import Search from "./Search";
import Layout from "../../components/layout/Layout";
import { DataProvider } from "../../stores/DataProvider";

export function SearchPage() {
  return (
    <DataProvider>
      <Layout>
        <Search />
      </Layout>
    </DataProvider>
  );
}
