import { useParams } from "react-router";
import { DataProvider } from "@/entities/product/model/DataProvider";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import ScrapeResult from "./ui/ScrapeResult";

export function ResultView() {
  const { keyword } = useParams();
  useDocumentTitle(keyword);

  return (
    <DataProvider>
      <ScrapeResult />
    </DataProvider>
  );
}
