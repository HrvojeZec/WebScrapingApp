import { createBrowserRouter } from "react-router";
import { PageTransition } from "@/shared/ui/motion/PageTransition/PageTransition";
import { publicRoutes } from "./routes/public-routes";

export const router = createBrowserRouter([
  {
    element: <PageTransition />,
    children: [...publicRoutes],
  },
]);
