import { Button, Text } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import type { CategorySlug } from "@storeseeker/shared";
import { StoreBadge } from "@/shared/ui/StoreBadge/StoreBadge";
import { useRefreshPrices } from "../../hooks/useRefreshPrices";
import { REFRESH_TEXT } from "../../model/constants";
import classes from "./RefreshPrices.module.scss";

type Props = {
  /** The categories to crawl, see `refreshCategories` */
  categories: CategorySlug[];
};

/** The "Osvježi cijene" button with the status of the refresh per store. */
export function RefreshPrices({ categories }: Props) {
  const { start, message, storeLines, error, isRunning } = useRefreshPrices(categories);

  return (
    <div className={classes.root}>
      <Button
        variant="default"
        leftSection={<IconRefresh aria-hidden className={classes.icon} />}
        onClick={start}
        loading={isRunning}
        className={classes.button}
      >
        {REFRESH_TEXT.button}
      </Button>
      <div role="status" className={classes.status}>
        {message && <Text className={classes.message}>{message}</Text>}
        {storeLines.length > 0 && (
          <ul className={classes.stores}>
            {storeLines.map((line) => (
              <li key={line.storeSlug} className={classes.store}>
                <StoreBadge name={line.name} />
                <span>{line.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <Text role="alert" className={classes.error}>
          {error}
        </Text>
      )}
    </div>
  );
}
