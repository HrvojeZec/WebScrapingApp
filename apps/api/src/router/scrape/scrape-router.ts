import express, { NextFunction, Request, Response } from 'express';
import axios from 'axios';
const { CustomInternalServerError } = require('../../middleware/CustomError');
const { createNewScrape, endScrapeStatus } = require('./scrape-service');
const router = express.Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const { keyword } = req.body || {};

  if (!keyword) {
    return res.status(400).json({ error: 'Ključna riječ je obavezna.' });
  }
  try {
    const response = await createNewScrape(keyword);

    res.status(200).json(response.newScrapingJob._id);
    const scrapeJob = response.newScrapingJob || response.updatedScrape;

    await axios.post(
      'http://localhost:5001/api/execute',
      {
        keyword: keyword,
        newScrapingJob: scrapeJob,
      },
      {
        headers: { Accept: 'application/json' },
      },
    );
    await endScrapeStatus(scrapeJob._id);
    console.log(
      `end scrape status set scrape with id ${scrapeJob._id} on finished!!`,
    );
  } catch (error: unknown) {
    let message = 'Nepoznata greška.';
    if (typeof error === 'object' && error !== null && 'message' in error) {
      message = (error as { message?: string }).message || message;
    }

    next(new CustomInternalServerError(`Nešto je pošlo po krivu: ${message}`));
  } finally {
    console.log('finally!!!!!!!!!!!!!!!!!!!!');
  }
});

module.exports = router;
