import React from "react";
import { DataProvider } from "../../stores/DataProvider";
import Layout from "../../components/layout/Layout";
import ScrapeResult from "./ScrapeResult";

export function ResultPage() {
  return (
    <DataProvider>
      <Layout>
        <ScrapeResult />
      </Layout>
    </DataProvider>
  );
}
