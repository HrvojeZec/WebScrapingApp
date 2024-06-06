const express = require("express");
const executeService = require("./scrape-service");
const CustomError = require("../../Utils/CustomError");
const router = express.Router();
let scrapingInProgress = false;

router.post("/", async (req, res, next) => {
  const { keyword } = req.body;
  //i dalje imam problem kod ovoga, kada pokrenem scrapanje i refresha stranicu i pokrenem ponovo
  //ovaj dio će se izvršiti i onda mi neće poslati  res.status(200).json({ status: "finished", products });
  // jer je već poslao response
  if (scrapingInProgress) {
    const err = new CustomError("Postupak je već u tijeku.", 400);
    next(err);
    /*  return res.status(400).json({ message: "Postupak je već u tijeku." }); */
  }

  try {
    scrapingInProgress = true;

    const products = await executeService(keyword);

    res.status(200).json({ status: "finished", products });
  } catch (error) {
    if (error.status === 404) {
      const err = new CustomError(
        "Nema proizvoda za danu ključnu riječ u obje trgovine.",
        error.status
      );
      next(err);
      /*  return res.status(404).json({
        message: "Nema proizvoda za danu ključnu riječ u obje trgovine.",
      }); */
    } else if (error.products) {
      const err = new CustomError(
        ` Neki izvori nisu uspješno scrapani.${error.products}`,
        207
      );
      next(err);
      /*   res.status(207).json({
        success: true,
        products: error.products,
        errors: error.errors,
        message: "Neki izvori nisu uspješno scrapani.",
      }); */
    } else {
      const err = new CustomError(
        `Nešto je pošlo po krivu: ${error.message}`,
        500
      );
      next(err);
      /* res.status(500).json({
        success: false,
        message: `Nešto je pošlo po krivu: ${error.message}`,
      }); */
    }
  } finally {
    scrapingInProgress = false;
  }
});

module.exports = router;
