import React from "react";
import Scrape from "./Scrape";
import Layout from "../../components/layout/Layout";
import { DataProvider } from "../../stores/DataProvider";
export function ScrapePage() {
  return (
    <DataProvider>
      {/*       <Layout> */}
      <Scrape />
      {/*    </Layout> */}
    </DataProvider>
  );
}
