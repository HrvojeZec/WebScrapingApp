import type { ReactNode } from "react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { cssVariablesResolver, theme } from "@/shared/theme/theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver}>
      <Notifications position="top-right" zIndex={1000} />
      {children}
    </MantineProvider>
  );
}
