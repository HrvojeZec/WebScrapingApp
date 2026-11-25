import type { ReactNode } from "react";
import { Text, Title } from "@mantine/core";
import classes from "./EmptyState.module.scss";

type Props = {
  title: string;
  /** What the user can do next */
  children?: ReactNode;
  /** A link or button that leads on */
  action?: ReactNode;
};

/** Nothing to show here, with a way forward. */
export function EmptyState({ title, children, action }: Props) {
  return (
    <div className={classes.root}>
      <Title order={2} className={classes.title}>
        {title}
      </Title>
      {children && <Text className={classes.text}>{children}</Text>}
      {action}
    </div>
  );
}
