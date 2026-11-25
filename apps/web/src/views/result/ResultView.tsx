import { DataProvider } from "@/entities/product/model/DataProvider";
import Layout from "@/widgets/app-shell/ui/Layout";
import ScrapeResult from "./ui/ScrapeResult";

export function ResultView() {
  return (
    <DataProvider>
      <Layout>
        <ScrapeResult />
      </Layout>
    </DataProvider>
  );
}
