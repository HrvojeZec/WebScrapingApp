import type { ReactNode } from "react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { queryClient } from "@/shared/api/query-client";
import { UI } from "@/shared/constants/ui";
import { cssVariablesResolver, theme } from "@/shared/theme/theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver}>
        <MotionConfig reducedMotion="user">
          <Notifications
            position="top-right"
            zIndex={UI.notificationsZIndex}
            autoClose={UI.notificationAutoCloseMs}
          />
          {children}
        </MotionConfig>
      </MantineProvider>
    </QueryClientProvider>
  );
}
