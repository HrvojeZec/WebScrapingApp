const express = require("express");
const { mallScraping } = require("../controller/scrape/scrapeMALL");
const {
  sanctaDomenicaScraping,
} = require("../controller/scrape/scrapeSanctaDomenica");
const Product = require("../model/productModel");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [mallData, sanctaDomenicaData] = await Promise.all([
      mallScraping("https://www.mall.hr/"),
      sanctaDomenicaScraping("https://www.sancta-domenica.hr/"),
    ]);
    const mallProductsCount = mallData.length;
    const sanctaDomenicaProductsCount = sanctaDomenicaData.length;

    console.log("Broj proizvoda iz trgovine Mall:", mallProductsCount);
    console.log(
      "Broj proizvoda iz trgovine Sancta Domenica:",
      sanctaDomenicaProductsCount
    );

    const combinedData = [...mallData, ...sanctaDomenicaData];

    await Product.create(combinedData);
    res.json({ success: true, message: "Podaci uspješno spremljeni u bazu." });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
