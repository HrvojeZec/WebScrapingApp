const express = require("express");
const router = express.Router();
const { StoresData } = require("../../boostrap/setup");
const addStore = require("./stores-service");
const {
  CustomBadRequest,
  CustomInternalServerError,
  CustomNotFound,
} = require("../../middleware/CustomError");
const Stores = require("../../model/storesModel");

router.post("/add", async (req, res, next) => {
  const { storeName } = req.body;
  if (storeName === "") {
    const err = new CustomNotFound("Ime trgovine je obavezno!");
    next(err);
  }
  try {
    const response = await addStore({ storeName });

    if (response.success) {
      res
        .status(200)
        .json({ success: true, message: "Trgovina je uspješno dodana" });
    } else {
      let err;
      switch (response.error) {
        case "STORE_ALREADY_EXISTS":
          err = CustomBadRequest("Trgovina je već dodana u bazu");
          break;
        case "INSERTION_FAILED":
          err = CustomInternalServerError(
            "Došlo je do pogreške prilikom dodavanja trgovine u bazu"
          );
          break;
        default:
          break;
      }

      return next(err);
    }
  } catch (error) {
    const err = new CustomInternalServerError(
      "Došlo je do pogreške prilikom obrade zahtjeva"
    );
    next(err);
  }
});

module.exports = router;
