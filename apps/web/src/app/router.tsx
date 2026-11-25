import { createBrowserRouter } from "react-router";
import { SearchView } from "@/views/search/SearchView";
import { ResultView } from "@/views/result/ResultView";

export const router = createBrowserRouter([
  { path: "/", element: <SearchView /> },
  { path: "/rezultati/:keyword", element: <ResultView /> },
]);
