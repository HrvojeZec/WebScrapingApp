import express from "express";
import {
  findProductsByKeyword,
  findRandomProducts,
  findAllKeywords,
  paginationHandler,
  findProductsByKeywordAndStoreID,
} from "../product/product-service";
import {
  CustomBadRequest,
  CustomInternalServerError,
  CustomNotFound,
} from "../../middleware/CustomError";
const router = express.Router();
// Get products by keyword
router.get("/keyword", async (req, res, next) => {
  const { keyword, page, pageSize, storeId } = req.query;

  if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
    const err = new CustomBadRequest("Molimo unesite ključnu riječ za pretragu proizvoda.");
    return next(err);
  }
  console.log(storeId);

  try {
    const paginationData = await paginationHandler(keyword, Number(page), Number(pageSize));
    let products;
    if (storeId) {
      console.log("findProductsByKeywordAndStoreID");
      console.log(keyword);
      console.log(paginationData.skip);
      console.log(paginationData.limit);

      products = await findProductsByKeywordAndStoreID(
        keyword,
        storeId as string,
        paginationData.skip,
        paginationData.limit,
      );
    } else {
      console.log("findProductsByKeyword");
      products = await findProductsByKeyword(keyword, paginationData.skip, paginationData.limit);
    }

    if (products.length === 0) {
      const err = new CustomNotFound("Nema proizvoda s danom ključnom riječi.");
      return next(err);
    }
    console.log(products);

    return res.status(200).json({
      products,
      totalPages: paginationData.totalPages,
      currentPage: page,
    });
  } catch {
    const err = new CustomInternalServerError("Došlo je do pogreške prilikom pretrage proizvoda.");
    return next(err);
  }
});

// Get 10 random products
router.get("/randomProducts", async (req, res, next) => {
  try {
    const products = await findRandomProducts();
    return res.status(200).json(products);
  } catch {
    const err = new CustomInternalServerError(
      "Došlo je do pogreške prilikom dohvata nasumičnih proizvoda.",
    );
    return next(err);
  }
});

router.get("/allKeywords", async (req, res, next) => {
  try {
    const response = await findAllKeywords();

    return res.status(200).json(response);
  } catch {
    const err = new CustomInternalServerError("Došlo je do greške prilikom dohvaćanja keyowrds-a.");
    return next(err);
  }
});

export default router;
