import React from "react";
import { BrandShopee } from "tabler-icons-react";
import classes from "../../../assets/stylesheets/brandLogo.module.scss";
export function SmartShop({ showLogo }) {
  return (
    <div className={classes.logo__wrapper}>
      {showLogo && (
        <BrandShopee size={48} strokeWidth={2} className={classes.logo} />
      )}
      <div className={classes.logo__name}>
        <p>
          <span className={classes.brand__smart}>Smart</span>
          <span className={classes.brand__shop}>Shop</span>
        </p>
      </div>
    </div>
  );
}

export function SmartShopText() {
  return (
    <h1>
      Otkrijte najbolje ponude uz{" "}
      <span className={classes.upper__Smart}>Smart</span>
      <span className={classes.upper__Shop}>Shop</span>
    </h1>
  );
}
