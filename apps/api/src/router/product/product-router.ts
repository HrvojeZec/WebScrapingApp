import express from "express";
import {
  findProductsByKeyword,
  findRandomProducts,
  findAllKeywords,
  paginationHandler,
  findProductsByKeywordAndStoreID,
} from "../product/product-service";
import { badRequest, notFound } from "../../http/errors";

// Legacy routes, replaced by the new product module in v0.3 (#24). Unexpected errors reach the
// error handler on their own, because Express 5 forwards rejected promises.
const router = express.Router();

router.get("/keyword", async (req, res) => {
  const { keyword, page, pageSize, storeId } = req.query;

  if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
    throw badRequest("Molimo unesite ključnu riječ za pretragu proizvoda.");
  }

  const paginationData = await paginationHandler(keyword, Number(page), Number(pageSize));
  const products = storeId
    ? await findProductsByKeywordAndStoreID(
        keyword,
        storeId as string,
        paginationData.skip,
        paginationData.limit,
      )
    : await findProductsByKeyword(keyword, paginationData.skip, paginationData.limit);

  if (products.length === 0) {
    throw notFound("Nema proizvoda s danom ključnom riječi.");
  }

  res.status(200).json({
    products,
    totalPages: paginationData.totalPages,
    currentPage: page,
  });
});

// Get 10 random products
router.get("/randomProducts", async (_req, res) => {
  res.status(200).json(await findRandomProducts());
});

router.get("/allKeywords", async (_req, res) => {
  res.status(200).json(await findAllKeywords());
});

export default router;
