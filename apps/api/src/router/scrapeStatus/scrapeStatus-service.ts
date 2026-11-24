import { Scrape } from '../../model/scrapeModel';
import mongoose from 'mongoose';

const findScrapeByID = async (scrapeId: mongoose.Types.ObjectId) => {
  const objectId = new mongoose.Types.ObjectId(scrapeId);
  const result = await Scrape.findOne(objectId);

  return result;
};

module.exports = findScrapeByID;
