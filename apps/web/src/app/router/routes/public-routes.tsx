import type { RouteObject } from "react-router";
import { ROUTES } from "@/shared/constants/routes";
import { NotFoundView } from "@/views/not-found/NotFoundView";
import { ResultView } from "@/views/result/ResultView";
import { SearchView } from "@/views/search/SearchView";

export const publicRoutes: RouteObject[] = [
  { path: ROUTES.home, element: <SearchView /> },
  // The old results page until Task 6 (#26) replaces it with ROUTES.search
  { path: "/rezultati/:keyword", element: <ResultView /> },
  { path: ROUTES.notFound, element: <NotFoundView /> },
];
