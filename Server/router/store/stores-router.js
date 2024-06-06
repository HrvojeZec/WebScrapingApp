const express = require("express");
const router = express.Router();
const { StoresData } = require("../../boostrap/setup");
const addStore = require("./stores-service");
const CustomError = require("../../Utils/CustomError");
const Stores = require("../../model/storesModel");

router.get("/", async (req, res, next) => {
  try {
    console.log(StoresData);
    await Stores.create(StoresData);
    res.json({ success: true, message: "Podaci uspješno spremljeni u bazu." });
  } catch (error) {
    const err = new CustomError(
      "Došlo je do pogreške prilikom spremanja podataka u bazu.",
      500
    );
    next(err);
    /* res.status(500).json({
      success: false,
      message: "Došlo je do pogreške prilikom spremanja podataka u bazu.",
    }); */
  }
});

router.post("/add", async (req, res, next) => {
  const { storeName } = req.body;
  if (storeName === "") {
    const err = new CustomError("Ime trgovine je obavezno!", 404);
    next(err);
    /*  return res
      .status(404)
      .json({ success: true, message: "Ime trgovine je obavezno!" }); */
  }
  try {
    const response = await addStore({ storeName });

    if (response.success) {
      res
        .status(200)
        .json({ success: true, message: "Trgovina je uspješno dodana" });
    } else {
      let errMessage = "Nepoznata greška";
      let statusCode = 500;

      switch (response.error) {
        case "STORE_ALREADY_EXISTS":
          errMessage = "Trgovina je već dodana u bazu";
          statusCode = 400;
          break;
        case "INSERTION_FAILED":
          errMessage =
            "Došlo je do pogreške prilikom dodavanja trgovine u bazu";
          statusCode = 500;
          break;
        default:
          break;
      }

      return next(new CustomError(errMessage, statusCode));
    }
  } catch (error) {
    const err = new CustomError(
      "Došlo je do pogreške prilikom obrade zahtjeva",
      500
    );
    next(err);
    /* res.status(500).json({
      success: false,
      message: "Došlo je do pogreške prilikom obrade zahtjeva",
    }); */
  }
});

module.exports = router;
