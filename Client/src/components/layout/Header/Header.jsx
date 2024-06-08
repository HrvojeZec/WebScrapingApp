import React from "react";
import { SmartShop } from "../../shared/BrandLogo/SmartShop";
import classes from "./Header.module.scss";
import { Link } from "react-router-dom";

function Header() {
  return (
    <div className={classes.header} data-aos="fade-down">
      <div className={classes.header__wrapper}>
        <Link to="/" className={classes.header__link}>
          <SmartShop showLogo={true} />
        </Link>
      </div>
    </div>
  );
}

export default Header;
