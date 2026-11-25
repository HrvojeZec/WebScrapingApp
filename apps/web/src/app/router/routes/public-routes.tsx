import type { RouteObject } from "react-router";
import { SearchView } from "@/views/search/SearchView";
import { ResultView } from "@/views/result/ResultView";

export const publicRoutes: RouteObject[] = [
  { path: "/", element: <SearchView /> },
  { path: "/rezultati/:keyword", element: <ResultView /> },
];
