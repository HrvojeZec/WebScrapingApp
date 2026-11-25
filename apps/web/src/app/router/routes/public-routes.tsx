import type { RouteObject } from "react-router";
import { ROUTES } from "@/shared/constants/routes";
import { HomeView } from "@/views/home/HomeView";
import { NotFoundView } from "@/views/not-found/NotFoundView";
import { SearchView } from "@/views/search/SearchView";

export const publicRoutes: RouteObject[] = [
  { path: ROUTES.home, element: <HomeView /> },
  { path: ROUTES.search, element: <SearchView /> },
  { path: ROUTES.notFound, element: <NotFoundView /> },
];
