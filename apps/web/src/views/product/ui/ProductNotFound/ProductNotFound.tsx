import { Button } from "@mantine/core";
import { Link } from "react-router";
import { ROUTES } from "@/shared/constants/routes";
import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";
import { PRODUCT_TEXT } from "../../model/constants";
import classes from "./ProductNotFound.module.scss";

/** An unknown or malformed product id: what happened and the way back to the search. */
export function ProductNotFound() {
  return (
    <div className={classes.root}>
      <EmptyState
        title={PRODUCT_TEXT.notFoundTitle}
        titleOrder={1}
        action={
          <Button component={Link} to={ROUTES.search}>
            {PRODUCT_TEXT.toSearch}
          </Button>
        }
      >
        {PRODUCT_TEXT.notFoundText}
      </EmptyState>
    </div>
  );
}
