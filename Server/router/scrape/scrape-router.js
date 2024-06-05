const express = require("express");
const executeService = require("./scrape-service");
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

    const products = await executeService(keyword);
    res.status(200).json({ status: "finished", products });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        message: "Nema proizvoda za danu ključnu riječ u obje trgovine.",
      });
    } else if (error.products) {
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
    if (!res.headersSent) {
      scrapingInProgress = false;
    }
  }
});

module.exports = router;
