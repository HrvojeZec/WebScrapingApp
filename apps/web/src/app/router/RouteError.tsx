import { Container } from "@mantine/core";
import { useRouteError } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ErrorState } from "@/shared/ui/ErrorState/ErrorState";

const ERROR_TITLE = "Greška";

/** A page that crashed while rendering; the shell around it keeps working. */
export function RouteError() {
  const error = useRouteError();
  useDocumentTitle(ERROR_TITLE);

  return (
    <Container>
      <ErrorState error={error} onRetry={() => window.location.reload()} titleOrder={1} />
    </Container>
  );
}
