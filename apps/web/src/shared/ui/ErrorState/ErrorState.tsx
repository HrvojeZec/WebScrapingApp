import { Button, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { apiErrorMessage } from "@/shared/lib/api-error-message";
import classes from "./ErrorState.module.scss";

type Props = {
  error: unknown;
  /** Shows a "Pokušaj ponovo" button, e.g. a query's `refetch` */
  onRetry?: () => void;
};

/** What went wrong with a request and what to do; the only place query errors are shown. */
export function ErrorState({ error, onRetry }: Props) {
  return (
    <div className={classes.root} role="alert">
      <IconAlertTriangle className={classes.icon} aria-hidden />
      <Title order={2} className={classes.title}>
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
