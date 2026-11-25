import type { ReactNode } from "react";
import { Text, Title } from "@mantine/core";
import classes from "./SearchHeader.module.scss";

type Props = {
  heading: string;
  /** "86 proizvoda", or null while the first page loads */
  count: string | null;
  freshness: ReactNode;
  refresh: ReactNode;
  sort: ReactNode;
};

/** The top of the results: what was searched, how many, how fresh, refresh and sort. */
export function SearchHeader({ heading, count, freshness, refresh, sort }: Props) {
  return (
    <header className={classes.root}>
      <div className={classes.titleRow}>
        <div className={classes.title}>
          <Title order={1} className={classes.heading}>
            {heading}
          </Title>
          {count && <Text className={classes.count}>{count}</Text>}
        </div>
        <div className={classes.sort}>{sort}</div>
      </div>
      {freshness}
      {refresh}
    </header>
  );
}
