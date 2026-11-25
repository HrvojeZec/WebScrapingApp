import { Button } from "@mantine/core";
import { Link } from "react-router";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@storeseeker/shared";
import { ROUTES } from "@/shared/constants/routes";
import { HOME_TEXT } from "../../model/constants";
import classes from "./PopularCategories.module.scss";

/** Categories, not fixed terms: the demo seed has made-up products (plan decision 7). */
export function PopularCategories() {
  return (
    <nav className={classes.root} aria-labelledby="popular-heading">
      <span id="popular-heading" className={classes.label}>
        {HOME_TEXT.popular}
      </span>
      <ul className={classes.list}>
        {CATEGORY_SLUGS.map((slug) => (
          <li key={slug}>
            <Button
              component={Link}
              to={ROUTES.searchWith({ category: [slug] })}
              variant="default"
              radius="xl"
              size="sm"
            >
              {CATEGORY_LABELS[slug]}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
