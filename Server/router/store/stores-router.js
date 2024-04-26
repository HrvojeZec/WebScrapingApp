const express = require("express");
const Stores = require("../../model/storesModel");
const router = express.Router();
const StoresData = require("../../boostrap/setup");

router.get("/", async (req, res, next) => {
  try {
    console.log(StoresData);
    await Stores.create(StoresData);
    res.json({ success: true, message: "Podaci uspješno spremljeni u bazu." });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
