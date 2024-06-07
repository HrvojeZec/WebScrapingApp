const express = require("express");
const executeService = require("./scrape-service");
const {
  CustomBadRequest,
  CustomInternalServerError,
  CustomNotFound,
  CustomMultiStatus,
} = require("../../middleware/CustomError");
const router = express.Router();
let scrapingInProgress = false;

router.post("/", async (req, res, next) => {
  const { keyword } = req.body;
  //i dalje imam problem kod ovoga, kada pokrenem scrapanje i refresha stranicu i pokrenem ponovo
  //ovaj dio će se izvršiti i onda mi neće poslati  res.status(200).json({ status: "finished", products });
  // jer je već poslao response
  if (scrapingInProgress) {
    const err = new CustomBadRequest("Postupak je već u tijeku.");
    next(err);
  }

  try {
    scrapingInProgress = true;

    const products = await executeService(keyword);

    res.status(200).json({ status: "finished", products });
  } catch (error) {
    if (error.status === 404) {
      const err = new CustomNotFound(
        "Nema proizvoda za danu ključnu riječ u obje trgovine."
      );
      next(err);
    } else if (error.products) {
      const err = new CustomMultiStatus(
        ` Neki izvori nisu uspješno scrapani.${error.products}`
      );
      next(err);
    } else {
      const err = new CustomInternalServerError(
        `Nešto je pošlo po krivu: ${error.message}`
      );
      next(err);
    }
  } finally {
    scrapingInProgress = false;
  }
});

module.exports = router;
