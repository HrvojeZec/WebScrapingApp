import express, { NextFunction, Request, Response } from 'express';

const router = express.Router();
let scrapingInProgress = false;

export const setScrapingStatus = (status: boolean) => {
  scrapingInProgress = status;
};

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (scrapingInProgress) {
      throw new CustomBadRequest('Postupak je već u tijeku!');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
