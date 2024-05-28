const express = require("express");
const scrapeService = require("./scrape-service");
const router = express.Router();
let scrapingInProgress = false;

router.post("/", async (req, res, next) => {
  const { keyword } = req.body;

  if (!keyword || keyword.length === 0) {
    return res.status(400).json({ message: "Unesite traženi proizvod." });
  }
  if (scrapingInProgress) {
    return res.status(400).json({ message: "Postupak je već u tijeku." });
  }

  try {
    scrapingInProgress = true;
    const products = await scrapeService(keyword);
    res.status(200).json({ success: true, products });
  } catch (error) {
    if (error.products) {
      res.status(207).json({
        success: true,
        products: error.products,
        errors: error.errors,
        message: "Neki izvori nisu uspješno scrapani.",
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Nešto je pošlo po krivu: ${error.message}`,
      });
    }
  } finally {
    scrapingInProgress = false;
  }
});

module.exports = router;
