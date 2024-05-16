const express = require("express");
const Stores = require("../../model/brandModel");
const router = express.Router();
const { BrandData } = require("../../boostrap/setup");
const brandService = require("./brand-service");

router.get("/", async (req, res, next) => {
  try {
    console.log(BrandData);
    await Stores.create(BrandData);
    res.json({ success: true, message: "Podaci uspješno spremljeni u bazu." });
  } catch (error) {
    console.log(error);
  }
});

//dohvacamo podatke o brendu našemu
router.get("/getAll", async (req, res, next) => {
  try {
    const response = await brandService();
    return res.json(response);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
