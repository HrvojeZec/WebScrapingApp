import { log } from 'console';
import { Scrape } from '../../model/scrapeModel';
import { Keyword } from '../../types/params';
const activeScrape = require('../scrapeStatus/scrapeStatus-service');
import mongoose from 'mongoose';

const createNewScrape = async (keyword: Keyword) => {
  let existingScrape = await Scrape.findOne({
    status: 'started',
  }).exec();

  if (existingScrape) {
    existingScrape.startTime = new Date();
    existingScrape.status = 'started';

    await existingScrape.save();

    return { newScrapingJob: existingScrape, scrapeId: existingScrape._id };
  } else {
    const newScrapingJob = new Scrape({
      status: 'started',
      startTime: new Date(),
      keyword: keyword,
    });

    await newScrapingJob.save();
    const scrapeId = newScrapingJob._id;

    return { newScrapingJob, scrapeId };
  }
};

const endScrapeStatus = async (scrapeId: mongoose.Types.ObjectId) => {
  const ScrapingJob = await activeScrape(scrapeId);
  ScrapingJob.status = 'finished';
  ScrapingJob.endTime = new Date();
  await ScrapingJob.save();
};

module.exports = { createNewScrape, endScrapeStatus };
