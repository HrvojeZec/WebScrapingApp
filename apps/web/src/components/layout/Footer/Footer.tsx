import classes from "./Footer.module.scss";
import { SmartShop } from "../../shared/BrandLogo/SmartShop";
import { IconBrandFacebook, IconBrandX, IconBrandInstagram } from "@tabler/icons-react";
function Footer() {
  return (
    <div className={classes.footer}>
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
              <IconBrandFacebook size={48} strokeWidth={2} color={"#406fbf"} />
            </a>
            <a href="#">
              {" "}
              <IconBrandX size={48} strokeWidth={2} color={"#406fbf"} />
            </a>
            <a href="#">
              {" "}
              <IconBrandInstagram size={48} strokeWidth={2} color={"#E4405F"} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
