import type { ReactNode } from "react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

// Temporary until the design system (#42) brings the real theme
const theme = createTheme({
  fontFamily: '"IBM Plex Sans", sans-serif',
  headings: { fontFamily: '"IBM Plex Sans", sans-serif' },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      {children}
    </MantineProvider>
  );
}
