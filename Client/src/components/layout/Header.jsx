import React from "react";
import { SmartShop } from "../shared/BrandLogo/SmartShop";
import classes from "../../assets/stylesheets/Header.module.scss";

function Header() {
  return (
    <div className={classes.header} data-aos="fade-down">
      <div className={classes.header__wrapper}>
        <SmartShop showLogo={true} />
        <button className={classes.header__button}>
          <p>All Product</p>
        </button>
      </div>
    </div>
  );
}

export default Header;
