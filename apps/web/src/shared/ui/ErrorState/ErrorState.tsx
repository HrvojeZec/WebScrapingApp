import { Button, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { apiErrorMessage } from "@/shared/lib/api-error-message";
import classes from "./ErrorState.module.scss";

type Props = {
  /** 1 when the state is the whole page, 2 (default) inside a page with its own h1 */
  titleOrder?: 1 | 2 | 3;
  error: unknown;
  /** Shows a "Pokušaj ponovo" button, e.g. a query's `refetch` */
  onRetry?: () => void;
};

/** What went wrong with a request and what to do; the only place query errors are shown. */
export function ErrorState({ error, onRetry, titleOrder = 2 }: Props) {
  return (
    <div className={classes.root} role="alert">
      <IconAlertTriangle className={classes.icon} aria-hidden />
      <Title order={titleOrder} className={classes.title}>
        Podaci se nisu učitali
      </Title>
      <Text className={classes.message}>{apiErrorMessage(error)}</Text>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Pokušaj ponovo
        </Button>
      )}
    </div>
  );
}
