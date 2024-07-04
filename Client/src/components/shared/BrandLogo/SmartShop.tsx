import { BrandShopee } from "tabler-icons-react";
import classes from "./Brand.module.scss";

interface NotificationProps {
  showLogo: boolean;
}

export function SmartShop({ showLogo }: NotificationProps) {
  return (
    <div className={classes.logoWrapper}>
      {showLogo && (
        <BrandShopee size={48} strokeWidth={2} className={classes.logo} />
      )}
      <div className={classes.logoName}>
        <p>
          <span className={classes.brandSmart}>Store</span>
          <span className={classes.brandShop}>Seeker</span>
        </p>
      </div>
    </div>
  );
}

export function SmartShopText() {
  return (
    <h1>
      Otkrijte najbolje ponude uz{" "}
      <span className={classes.upperSmart}>Store</span>
      <span className={classes.upperShop}>Seeker</span>
    </h1>
  );
}
