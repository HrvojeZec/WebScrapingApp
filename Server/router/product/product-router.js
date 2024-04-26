const express = require("express");
const { findProductsByKeyword } = require("../product/product-service");
const router = express.Router();

router.get("/", async (req, res, next) => {
  const { keyword } = req.body;
  try {
    const response = await findProductsByKeyword(keyword);

    return res.json(response);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
