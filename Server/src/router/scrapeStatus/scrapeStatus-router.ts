import express, { NextFunction, Request, Response } from 'express';
const findScrapeByID = require('./scrapeStatus-service');

const router = express.Router();

router.get(
  '/:scrapeId',
  async (req: Request, res: Response, next: NextFunction) => {
    const scrapeId = req.params.scrapeId;

    try {
      const response = await findScrapeByID(scrapeId);

      if (response.status === 'started') {
        return res.status(200).json({
          status: response.status,
          message: 'Scraping je već u tijeku!',
        });
      } else if (response.status === 'finished') {
        return res.status(200).json({
          status: response.status,
          message: `Scraping za ${response.keyword} je završen!`,
        });
      }

      // Ako nema aktivnog scrapanja, vrati početni status
      return res
        .status(200)
        .json({ status: 'initial', message: 'Nema aktivnog scrapanja.' });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
