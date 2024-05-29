const express = require("express");
const router = express.Router();
const { StoresData } = require("../../boostrap/setup");
const addStore = require("./stores-service");

router.get("/", async (req, res, next) => {
  try {
    console.log(StoresData);
    await Stores.create(StoresData);
    res.json({ success: true, message: "Podaci uspješno spremljeni u bazu." });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Došlo je do pogreške prilikom spremanja podataka u bazu.",
    });
  }
});

router.post("/add", async (req, res, next) => {
  const { storeName } = req.body;
  if (storeName === "") {
    return res
      .status(404)
      .json({ success: true, message: "Ime trgovine je obavezno!" });
  }
  try {
    const response = await addStore({ storeName });

    if (response.success) {
      res
        .status(200)
        .json({ success: true, message: "Trgovina je uspješno dodana" });
    } else {
      switch (response.error) {
        case "STORE_ALREADY_EXISTS":
          res
            .status(400)
            .json({ success: false, message: "Trgovina je već dodana u bazu" });
          break;
        case "INSERTION_FAILED":
          res.status(500).json({
            success: false,
            message: "Došlo je do pogreške prilikom dodavanja trgovine u bazu",
          });
          break;
        default:
          res.status(500).json({ success: false, message: "Nepoznata greška" });
          break;
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Došlo je do pogreške prilikom obrade zahtjeva",
    });
  }
});

module.exports = router;
