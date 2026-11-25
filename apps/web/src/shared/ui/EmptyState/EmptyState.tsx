import type { ReactNode } from "react";
import { Text, Title } from "@mantine/core";
import classes from "./EmptyState.module.scss";

type Props = {
  /** 1 when the state is the whole page, 2 (default) inside a page with its own h1 */
  titleOrder?: 1 | 2 | 3;
  title: string;
  /** What the user can do next */
  children?: ReactNode;
  /** A link or button that leads on */
  action?: ReactNode;
};

/** Nothing to show here, with a way forward. */
export function EmptyState({ title, children, action, titleOrder = 2 }: Props) {
  return (
    <div className={classes.root}>
      <Title order={titleOrder} className={classes.title}>
        {title}
      </Title>
      {children && <Text className={classes.text}>{children}</Text>}
      {action}
    </div>
  );
}
