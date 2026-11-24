import { Scrape } from "../../model/scrapeModel";
import mongoose from "mongoose";

const findScrapeByID = async (scrapeId: string | mongoose.Types.ObjectId) => {
  const objectId = new mongoose.Types.ObjectId(scrapeId);
  const result = await Scrape.findOne(objectId);

  return result;
};

export default findScrapeByID;
