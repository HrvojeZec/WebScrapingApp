import React from "react";
import classes from "../../assets/stylesheets/footer.module.scss";
import { useBrandData } from "../../stores/GetBrandData";
import {
  BrandShopee,
  BrandFacebook,
  BrandTwitter,
  BrandInstagram,
} from "tabler-icons-react";
function Footer() {
  const { data: brandData } = useBrandData();
  const brandName = brandData[0].brandName;
  const brandNameParts = brandName.split("Shop");

  return (
    <div className={classes.footer} data-aos="fade-up">
      <div className={classes.footer__wrapper}>
        <div className={classes.footer__content}>
          <div className={classes.content__wrapper}>
            <BrandShopee size={48} strokeWidth={2} className={classes.logo} />
            <div className={classes.logo__name}>
              <p>
                <span className={classes.brand__smart}>
                  {brandNameParts[0]}
                </span>
                <span className={classes.brand__shop}>Shop</span>
              </p>
            </div>
          </div>
          <p>123 Main St, Cityville</p>
          <p>contact@smartshop.com</p>
        </div>
        <div className={classes.footer__company}>
          <h1>Company</h1>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Contact</a>
        </div>
        <div className={classes.footer__medias}>
          <h1>Follow us</h1>
          <div className={classes.medias__logo}>
            <a href="#">
              {" "}
              <BrandFacebook size={48} strokeWidth={2} color={"#406fbf"} />
            </a>
            <a href="#">
              {" "}
              <BrandTwitter size={48} strokeWidth={2} color={"#406fbf"} />
            </a>
            <a href="#">
              {" "}
              <BrandInstagram size={48} strokeWidth={2} color={"#E4405F"} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
