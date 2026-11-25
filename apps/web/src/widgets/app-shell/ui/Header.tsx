import { SmartShop } from "@/shared/ui/BrandLogo/SmartShop";
import classes from "./Header.module.scss";
import { Link } from "react-router";

function Header() {
  return (
    <div className={classes.header}>
      <div className={classes.headerWrapper}>
        <Link to="/" className={classes.headerLink}>
          <SmartShop showLogo={true} />
        </Link>
      </div>
    </div>
  );
}

export default Header;
