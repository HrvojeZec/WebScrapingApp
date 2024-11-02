import express, { NextFunction, Request, Response } from 'express';
const executeService = require('./scrape-service');
const {
  CustomBadRequest,
  CustomInternalServerError,
  CustomNotFound,
  CustomMultiStatus,
} = require('../../middleware/CustomError');
const router = express.Router();
import { Error } from '../../types/params';
import { setScrapingStatus } from './status-scrape-router';

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const { keyword } = req.body;

  try {
    setScrapingStatus(true);

    const products = await executeService(keyword);

    res.status(200).json({ status: 'finished', products });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.status === 404) {
      const customError = new CustomNotFound(
        'Nema proizvoda za danu ključnu riječ u obje trgovine.',
      );
      next(customError);
    } else if (err.products) {
      const customError = new CustomMultiStatus(
        ` Neki izvori nisu uspješno scrapani.${err.products}`,
      );
      next(customError);
    } else {
      const customError = new CustomInternalServerError(
        `Nešto je pošlo po krivu: ${err.message}`,
      );
      next(customError);
    }
  } finally {
    setScrapingStatus(false);
  }
});

module.exports = router;
