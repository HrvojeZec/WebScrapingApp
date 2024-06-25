import { BrandShopee } from "tabler-icons-react";
import classes from "../../../components/Brand/Brand.module.scss";

interface NotificationProps {
  showLogo: boolean;
}

export function SmartShop({ showLogo }:NotificationProps) {
  return (
    <div className={classes.logo__wrapper}>
      {showLogo && (
        <BrandShopee size={48} strokeWidth={2} className={classes.logo} />
      )}
      <div className={classes.logo__name}>
        <p>
          <span className={classes.brand__smart}>Store</span>
          <span className={classes.brand__shop}>Seeker</span>
        </p>
      </div>
    </div>
  );
}

export function SmartShopText() {
  return (
    <h1>
      Otkrijte najbolje ponude uz{" "}
      <span className={classes.upper__Smart}>Store</span>
      <span className={classes.upper__Shop}>Seeker</span>
    </h1>
  );
}
