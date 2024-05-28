import React from "react";
import { SmartShop } from "../shared/BrandLogo/SmartShop";
import classes from "../../assets/stylesheets/Header.module.scss";
import { Link } from "react-router-dom";

function Header() {
  return (
    <div className={classes.header} data-aos="fade-down">
      <div className={classes.header__wrapper}>
        <SmartShop showLogo={true} />
        <Link to="/">
          <button className={classes.header__button}>
            <p>Home</p>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Header;
