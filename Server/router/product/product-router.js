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
    if (response.false) {
      res.status(400).json(response);
    } else {
      res.json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Molimo unesite ključnu riječ za pretragu proizvoda.",
    });
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
