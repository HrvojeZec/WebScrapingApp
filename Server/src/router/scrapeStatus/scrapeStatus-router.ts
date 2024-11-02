import express, { NextFunction, Request, Response } from 'express';
const { getScrapingStatus } = require('./scrapeStatus-service');
const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  const status = getScrapingStatus();
  if (status) {
    return res.status(400).json({ message: 'Scraping je već u tijeku!' });
  }
  return res
    .status(200)
    .json({ status: 'idle', message: 'Nema aktivnog scrapanja.' });
});

module.exports = router;
