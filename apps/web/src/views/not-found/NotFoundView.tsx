import { Button, Container } from "@mantine/core";
import { Link } from "react-router";
import { ROUTES } from "@/shared/constants/routes";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";
import { NOT_FOUND_TEXT } from "./model/constants";

export function NotFoundView() {
  useDocumentTitle(NOT_FOUND_TEXT.documentTitle);

  return (
    <Container>
      <EmptyState
        title={NOT_FOUND_TEXT.title}
        action={
          <Button component={Link} to={ROUTES.home}>
            {NOT_FOUND_TEXT.homeLink}
          </Button>
        }
      >
        {NOT_FOUND_TEXT.description}
      </EmptyState>
    </Container>
  );
}
