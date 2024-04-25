const express = require("express");
const Stores = require("../model/storesModel");
const router = express.Router();
const StoresData = require("../boostrap/setup");
const { findProductsByKeyword } = require("../controller/product/product");
router.get("/", async (req, res, next) => {
  try {
    console.log(StoresData);
    await Stores.create(StoresData);
    res.json({ success: true, message: "Podaci uspješno spremljeni u bazu." });
  } catch (error) {
    console.log(error);
  }
});

router.get("/products", async (req, res, next) => {
  const { keyword } = req.body;
  try {
    const response = await findProductsByKeyword(keyword);

    return res.json(response);
  } catch (error) {}
});

module.exports = router;
