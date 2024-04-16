const express = require("express");
const { mallScraping } = require("../controller/scrape/scrapeMALL");
const {
  sanctaDomenicaScraping,
} = require("../controller/scrape/scrapeSanctaDomenica");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    /*   const mallData = await mallScraping("https://www.mall.hr/"); */
    const sanctaDomenicaData = await sanctaDomenicaScraping(
      "https://www.sancta-domenica.hr/"
    );
    /*   const combinedData = [...mallData, ...sanctaDomenicaData]; */

    res.json(sanctaDomenicaData);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
