const fs = require("fs");
const path = require("path");
const mallLogo = fs.readFileSync(
  path.resolve(__dirname, "../assets/logo.svg"),
  "utf8"
);
const brandLogo = fs.readFileSync(
  path.resolve(__dirname, "../assets/brand-logo.svg"),
  "utf8"
);
const StoresData = [
  {
    storeName: "Mall",
    logo: mallLogo,
  },
  {
    storeName: "Sancta Domenica",
    logo: "https://cdn.sancta-domenica.hr/static/version1713185553/frontend/SanctaDomenica/theme/hr_HR//images/logo.svg",
  },
];

const BrandData = [
  {
    brandName: "SmartShop",
    logo: brandLogo,
  },
];

module.exports = { StoresData, BrandData };
