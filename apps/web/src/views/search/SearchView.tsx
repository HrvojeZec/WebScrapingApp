import Search from "./ui/Search";
import { DataProvider } from "@/entities/product/model/DataProvider";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";

export function SearchView() {
  useDocumentTitle();

  return (
    <DataProvider>
      <Search />
    </DataProvider>
  );
}
