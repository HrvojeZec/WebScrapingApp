import classes from "./Footer.module.scss";
import { SmartShop } from "../../shared/BrandLogo/SmartShop";
import {
  BrandFacebook,
  BrandTwitter,
  BrandInstagram,
} from "tabler-icons-react";
function Footer() {
  return (
    <div className={classes.footer} data-aos="fade-up">
      <div className={classes.footerWrapper}>
        <div className={classes.footerContent}>
          <SmartShop showLogo={true} />
          <p>123 Glavna ulica, Grad</p>
          <p>kontakt@pametandućan.com</p>
        </div>
        <div className={classes.footerCompany}>
          <a>Company</a>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Contact</a>
        </div>
        <div className={classes.footerMedias}>
          <a>Follow us</a>
          <div className={classes.mediasLogo}>
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
