import { Container } from "@mantine/core";
import { IconBrandShopee } from "@tabler/icons-react";
import { Link } from "react-router";
import { SearchBox } from "@/features/search-products/ui/SearchBox/SearchBox";
import { ROUTES } from "@/shared/constants/routes";
import { SHELL_TEXT } from "../../model/constants";
import classes from "./Header.module.scss";

export function Header() {
  return (
    <header className={classes.header}>
      <Container className={classes.inner}>
        <Link to={ROUTES.home} className={classes.logo} aria-label={SHELL_TEXT.homeLink}>
          <IconBrandShopee aria-hidden className={classes.logoIcon} />
          <span className={classes.logoName}>
            Store<span className={classes.logoAccent}>Seeker</span>
          </span>
        </Link>
        <div className={classes.search}>
          <SearchBox size="header" />
        </div>
      </Container>
    </header>
  );
}
