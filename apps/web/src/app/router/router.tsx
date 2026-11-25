import { createBrowserRouter, ScrollRestoration } from "react-router";
import { PageTransition } from "@/shared/ui/motion/PageTransition/PageTransition";
import { AppShell } from "@/widgets/app-shell/ui/AppShell/AppShell";
import { RouteError } from "./RouteError";
import { publicRoutes } from "./routes/public-routes";

export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollRestoration />
        <AppShell />
      </>
    ),
    children: [
      {
        // Below the shell, so the header stays put while pages fade and a crash keeps the header
        element: <PageTransition />,
        errorElement: <RouteError />,
        children: [...publicRoutes],
      },
    ],
  },
]);
