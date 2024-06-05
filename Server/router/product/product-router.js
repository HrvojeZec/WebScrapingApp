const express = require("express");
const {
  findProductsByKeyword,
  findAllProducts,
  findRandomProducts,
  findAllKeywords,
  findProductsByScrapeId,
} = require("../product/product-service");

const router = express.Router();

// Get products by keyword
router.get("/keyword", async (req, res, next) => {
  const keyword = req.query.keyword;
  if (!keyword || keyword.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Molimo unesite ključnu riječ za pretragu proizvoda.",
    });
  }

  try {
    const products = await findProductsByKeyword(keyword);
    if (products.length === 0) {
      return res.status(404).json({
        data: products,
        message: "Nema proizvoda s danom ključnom riječi.",
      });
    }
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Došlo je do pogreške prilikom pretrage proizvoda.",
    });
  }
});

// Get all products
router.get("/", async (req, res, next) => {
  try {
    const products = await findAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Došlo je do pogreške prilikom dohvata svih proizvoda.",
    });
  }
});

// Get 10 random products
router.get("/randomProducts", async (req, res, next) => {
  try {
    const products = await findRandomProducts();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Došlo je do pogreške prilikom dohvata nasumičnih proizvoda.",
    });
  }
});

router.get("/allKeywords", async (req, res, next) => {
  try {
    const response = await findAllKeywords();

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Došlo je do greške prilikom dohvaćanja keyowrds-a.",
    });
  }
});

//dohvacanje proizvoda po scrapeIdu ako su finished
router.get("/scrapeId", async (req, res, next) => {
  const scrapeId = req.query.scrapeId;

  try {
    const response = await findProductsByScrapeId(scrapeId);
    console.log(response);
    if (response.length === 0) {
      return res.status(404).json({
        success: true,
        message: "Nema proizvoda s danim scrape ID-om.",
      });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Došlo je do pogreške prilikom pretrage proizvoda.",
    });
  }
});

module.exports = router;
