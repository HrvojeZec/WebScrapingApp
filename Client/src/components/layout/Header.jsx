import React from "react";
import { useBrandData } from "../../stores/GetBrandData";
import classes from "../../assets/stylesheets/Header.module.scss";
import { BrandShopee } from "tabler-icons-react";
function Header() {
  const { data: data } = useBrandData();
  const brandData = data[0];
  const brandName = brandData.brandName;
  const brandNameParts = brandName.split("Shop");

  return (
    <div className={classes.header}>
      <div className={classes.header__wrapper}>
        <div className={classes.logo__wrapper}>
          <BrandShopee size={48} strokeWidth={2} color={"#ff7f50"} />
          <div className={classes.logo__name}>
            <p>
              <span className={classes.brand__smart}>{brandNameParts[0]}</span>
              <span className={classes.brand__shop}>Shop</span>
            </p>
          </div>
        </div>
        <button className={classes.header__button}>
          <p>All Product</p>
        </button>
      </div>
    </div>
  );
}

export default Header;
