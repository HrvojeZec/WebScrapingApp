import type { ReactNode } from "react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { MotionConfig } from "motion/react";
import { cssVariablesResolver, theme } from "@/shared/theme/theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver}>
      <MotionConfig reducedMotion="user">
        <Notifications position="top-right" zIndex={1000} />
        {children}
      </MotionConfig>
    </MantineProvider>
  );
}
