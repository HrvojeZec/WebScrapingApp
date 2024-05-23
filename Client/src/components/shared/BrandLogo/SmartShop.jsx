import React from "react";
import { useBrandData } from "../../../stores/GetBrandData";
import { BrandShopee } from "tabler-icons-react";
import classes from "../../../assets/stylesheets/brandLogo.module.scss";
export function SmartShop({ showLogo }) {
  const { data: data } = useBrandData();
  const brandData = data[0];
  const brandName = brandData.brandName;
  const brandNameParts = brandName.split("Shop");
  return (
    <div className={classes.logo__wrapper}>
      {showLogo && (
        <BrandShopee size={48} strokeWidth={2} className={classes.logo} />
      )}
      <div className={classes.logo__name}>
        <p>
          <span className={classes.brand__smart}>{brandNameParts[0]}</span>
          <span className={classes.brand__shop}>Shop</span>
        </p>
      </div>
    </div>
  );
}

export function SmartShopText() {
  const { data: data } = useBrandData();
  const brandData = data[0];
  const brandName = brandData.brandName;
  const brandNameParts = brandName.split("Shop");
  return (
    <h1>
      Otkrijte najbolje ponude uz{" "}
      <span className={classes.upper__Smart}>{brandNameParts[0]}</span>
      <span className={classes.upper__Shop}>Shop</span>
    </h1>
  );
}
