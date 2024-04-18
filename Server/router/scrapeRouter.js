const express = require("express");
const { mallScraping } = require("../controller/scrape/scrapeMALL");
const {
  sanctaDomenicaScraping,
} = require("../controller/scrape/scrapeSanctaDomenica");
const Product = require("../model/productModel");
const router = express.Router();
let scapingInProgress = false;

router.get("/", async (req, res, next) => {
  if (scapingInProgress) {
    return res.status(400).json({ message: "Postupak je već u tijeku" });
  }
  try {
    scapingInProgress = true;
    const mallDataPromise = mallScraping();
    const sanctaDomenicaDataPromise = sanctaDomenicaScraping();
    const promises = [mallDataPromise, sanctaDomenicaDataPromise];
    const scrapingFunctions = [mallScraping, sanctaDomenicaScraping];

    const results = await Promise.allSettled(promises);

    results.forEach(async (result, index) => {
      if (result.status === "rejected") {
        const functionName =
          scrapingFunctions[index].name || `Function${index + 1}`;
        console.error(`Promise ${functionName} rejected with ${result.reason}`);
      } else {
        const combinedData = result.value;
        await Product.create(combinedData);
      }
    });

    res.json({ success: true, message: "Podaci uspješno spremljeni u bazu." });
  } catch (error) {
    console.log(error);
  } finally {
    scapingInProgress = false;
  }
});

module.exports = router;
