import React from "react";
import classes from "../../assets/stylesheets/footer.module.scss";
import { SmartShop } from "../shared/BrandLogo/SmartShop";
import {
  BrandFacebook,
  BrandTwitter,
  BrandInstagram,
} from "tabler-icons-react";
function Footer() {
  return (
    <div className={classes.footer} data-aos="fade-up">
      <div className={classes.footer__wrapper}>
        <div className={classes.footer__content}>
          <SmartShop showLogo={true} />
          <p>123 Main St, Cityville</p>
          <p>contact@smartshop.com</p>
        </div>
        <div className={classes.footer__company}>
          <a>Company</a>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Contact</a>
        </div>
        <div className={classes.footer__medias}>
          <a>Follow us</a>
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
