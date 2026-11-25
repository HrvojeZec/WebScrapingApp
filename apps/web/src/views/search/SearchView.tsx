import Search from "./ui/Search";
import Layout from "@/widgets/app-shell/ui/Layout";
import { DataProvider } from "@/entities/product/model/DataProvider";

export function SearchView() {
  return (
    <DataProvider>
      <Layout>
        <Search />
      </Layout>
    </DataProvider>
  );
}
