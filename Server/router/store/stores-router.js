const express = require("express");
const Stores = require("../../model/storesModel");
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
  }
});

router.post("/add", async (req, res, next) => {
  const { storeName } = req.body;

  try {
    const response = await addStore({ storeName: storeName });
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(400).json(response);
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
