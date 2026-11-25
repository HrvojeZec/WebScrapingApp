import { createBrowserRouter } from "react-router";
import { PageTransition } from "@/shared/ui/motion/PageTransition/PageTransition";
import { SearchView } from "@/views/search/SearchView";
import { ResultView } from "@/views/result/ResultView";

export const router = createBrowserRouter([
  {
    element: <PageTransition />,
    children: [
      { path: "/", element: <SearchView /> },
      { path: "/rezultati/:keyword", element: <ResultView /> },
    ],
  },
]);
