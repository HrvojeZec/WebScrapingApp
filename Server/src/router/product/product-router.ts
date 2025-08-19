import { log } from 'console';
import express, { NextFunction, Request, Response } from 'express';
const {
  findProductsByKeyword,
  findAllProducts,
  findRandomProducts,
  findAllKeywords,
  findProductsByScrapeId,
  paginationHandler,
  findProductsByKeywordAndStoreID,
} = require('../product/product-service');
const {
  CustomBadRequest,
  CustomInternalServerError,
  CustomNotFound,
} = require('../../middleware/CustomError');
const router = express.Router();
const { Product } = require('../../model/productModel'); // Model za proizvod
const { Scrape } = require('../../model/scrapeModel'); // Model za scrape (ako treba)
// Get products by keyword
router.get('/keyword', async (req, res, next) => {
  const { keyword, page, pageSize, storeId } = req.query;

  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    const err = new CustomBadRequest(
      'Molimo unesite ključnu riječ za pretragu proizvoda.',
    );
    return next(err);
  }
  console.log(storeId);

  try {
    const paginationData = await paginationHandler(keyword, page, pageSize);
    let products;
    if (storeId) {
      console.log('findProductsByKeywordAndStoreID');
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
      console.log('findProductsByKeyword');
      products = await findProductsByKeyword(
        keyword,
        paginationData.skip,
        paginationData.limit,
      );
    }

    if (products.length === 0) {
      const err = new CustomNotFound('Nema proizvoda s danom ključnom riječi.');
      return next(err);
    }
    console.log(products);

    return res.status(200).json({
      products,
      totalPages: paginationData.totalPages,
      currentPage: page,
    });
  } catch (error) {
    const err = new CustomInternalServerError(
      'Došlo je do pogreške prilikom pretrage proizvoda.',
    );
    return next(err);
  }
});

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const products = await findAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    const err = new CustomInternalServerError(
      'Došlo je do pogreške prilikom dohvata svih proizvoda.',
    );
    return next(err);
  }
});

// Get 10 random products
router.get('/randomProducts', async (req, res, next) => {
  try {
    const products = await findRandomProducts();
    return res.status(200).json(products);
  } catch (error) {
    const err = new CustomInternalServerError(
      'Došlo je do pogreške prilikom dohvata nasumičnih proizvoda.',
    );
    return next(err);
  }
});

router.get('/allKeywords', async (req, res, next) => {
  try {
    const response = await findAllKeywords();

    return res.status(200).json(response);
  } catch (error) {
    const err = new CustomInternalServerError(
      'Došlo je do greške prilikom dohvaćanja keyowrds-a.',
    );
    return next(err);
  }
});

//dohvacanje proizvoda po scrapeIdu ako su finished
router.get('/scrapeId', async (req, res, next) => {
  const scrapeId = req.query.scrapeId;

  try {
    const response = await findProductsByScrapeId(scrapeId);
    console.log(response);
    if (response.length === 0) {
      const err = new CustomNotFound('Nema proizvoda s danim scrape ID-om.');
      return next(err);
    }
    return res.status(200).json(response);
  } catch (error) {
    const err = new CustomInternalServerError(
      'Došlo je do pogreške prilikom pretrage proizvoda.',
    );
    return next(err);
  }
});

router.delete(
  '/delete-products',
  async (req: Request, res: Response, next: NextFunction) => {
    const { keyword } = req.body;
    console.log(keyword);

    if (!keyword) {
      return res.status(400).json({ error: 'Ključna riječ je obavezna.' });
    }

    try {
      // Prvo brišemo proizvode koji imaju taj keyword
      const result = await Product.deleteMany({ keyword: keyword });

      if (result.deletedCount > 0) {
        return res.status(200).json({
          message: `Obrisano ${result.deletedCount} proizvoda pod keywordom: ${keyword}.`,
        });
      } else {
        return res
          .status(404)
          .json({ message: 'Nema proizvoda za dati keyword.' });
      }
    } catch (error) {
      next(new Error('Došlo je do greške prilikom brisanja proizvoda.'));
    }
  },
);

module.exports = router;
