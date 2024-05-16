import React from "react";
import Scrape from "./Scrape";
import Layout from "../../components/layout/Layout";
export function ScrapePage() {
  return (
    <div>
      {/*  data provider */}
      <Layout>
        <Scrape />
      </Layout>
    </div>
  );
}
