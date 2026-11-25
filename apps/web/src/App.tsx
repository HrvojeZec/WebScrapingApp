import { createBrowserRouter, RouterProvider } from "react-router";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { SearchPage } from "./views/SearchPage/SearchPage";
import { ResultPage } from "./views/ResultPage/ResultPage";

// Temporary until the design system (#42) brings the real theme
const theme = createTheme({
  fontFamily: '"IBM Plex Sans", sans-serif',
  headings: { fontFamily: '"IBM Plex Sans", sans-serif' },
});

const router = createBrowserRouter([
  { path: "/", element: <SearchPage /> },
  { path: "/rezultati/:keyword", element: <ResultPage /> },
]);

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App;
