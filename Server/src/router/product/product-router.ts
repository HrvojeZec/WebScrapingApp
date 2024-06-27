import express from "express";
const {
  findProductsByKeyword,
  findAllProducts,
  findRandomProducts,
  findAllKeywords,
  findProductsByScrapeId,
  paginationHandler,
} = require("../product/product-service");
const {
  CustomBadRequest,
  CustomInternalServerError,
  CustomNotFound,
} = require("../../middleware/CustomError");
const router = express.Router();

// Get products by keyword
router.get("/keyword", async (req, res, next) => {
  const { keyword, page, pageSize } = req.query;

  if (!keyword || (typeof keyword !== "string") || keyword.trim().length === 0) {
    const err = new CustomBadRequest(
      "Molimo unesite ključnu riječ za pretragu proizvoda."
    );
    return next(err);
  }

  try {
    const paginationData = await paginationHandler(keyword, page, pageSize);

    const products = await findProductsByKeyword(
      keyword,
      paginationData.skip,
      paginationData.limit
    );
    if (products.length === 0) {
      const err = new CustomNotFound("Nema proizvoda s danom ključnom riječi.");
      return next(err);
    }

    return res.status(200).json({
      products,
      totalPages: paginationData.totalPages,
      currentPage: page,
    });
  } catch (error) {
    const err = new CustomInternalServerError(
      "Došlo je do pogreške prilikom pretrage proizvoda."
    );
    return next(err);
  }
});

// Get all products
router.get("/", async (req, res, next) => {
  try {
    const products = await findAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    const err = new CustomInternalServerError(
      "Došlo je do pogreške prilikom dohvata svih proizvoda."
    );
    return next(err);
  }
});

// Get 10 random products
router.get("/randomProducts", async (req, res, next) => {
  try {
    const products = await findRandomProducts();
    return res.status(200).json(products);
  } catch (error) {
    const err = new CustomInternalServerError(
      "Došlo je do pogreške prilikom dohvata nasumičnih proizvoda."
    );
    return next(err);
  }
});

router.get("/allKeywords", async (req, res, next) => {
  try {
    const response = await findAllKeywords();

    return res.status(200).json(response);
  } catch (error) {
    const err = new CustomInternalServerError(
      "Došlo je do greške prilikom dohvaćanja keyowrds-a."
    );
    return next(err);
  }
});

//dohvacanje proizvoda po scrapeIdu ako su finished
router.get("/scrapeId", async (req, res, next) => {
  const scrapeId = req.query.scrapeId;

  try {
    const response = await findProductsByScrapeId(scrapeId);
    console.log(response);
    if (response.length === 0) {
      const err = new CustomNotFound("Nema proizvoda s danim scrape ID-om.");
      return next(err);
    }
    return res.status(200).json(response);
  } catch (error) {
    const err = new CustomInternalServerError(
      "Došlo je do pogreške prilikom pretrage proizvoda."
    );
    return next(err);
  }
});

module.exports = router;
