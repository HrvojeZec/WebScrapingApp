const express = require("express");
const {
  findProductsByKeyword,
  findAllProducts,
} = require("../product/product-service");
const router = express.Router();
//dohvaca proizvode po keywordu
router.get("/keyword", async (req, res, next) => {
  const keyword = req.query.keyword;
  console.log(keyword);
  try {
    const response = await findProductsByKeyword(keyword);
    return res.json(response);
  } catch (error) {
    console.log(error);
  }
});

//dohvacanje svih proizvoda

router.get("/", async (req, res, next) => {
  try {
    const response = await findAllProducts();
    return res.json(response);
  } catch (error) {
    throw error;
  }
});

module.exports = router;
