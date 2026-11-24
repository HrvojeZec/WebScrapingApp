import { Scrape } from "../../model/scrapeModel";
import findScrapeByID from "../scrapeStatus/scrapeStatus-service";
import mongoose from "mongoose";

export const createNewScrape = async (keyword: string) => {
  const existingScrape = await Scrape.findOne({
    status: "started",
  }).exec();

  if (existingScrape) {
    existingScrape.startTime = new Date();
    existingScrape.status = "started";

    await existingScrape.save();

    return { newScrapingJob: existingScrape, scrapeId: existingScrape._id };
  } else {
    const newScrapingJob = new Scrape({
      status: "started",
      startTime: new Date(),
      keyword: keyword,
    });

    await newScrapingJob.save();
    const scrapeId = newScrapingJob._id;

    return { newScrapingJob, scrapeId };
  }
};

export const endScrapeStatus = async (scrapeId: mongoose.Types.ObjectId) => {
  const ScrapingJob = await findScrapeByID(scrapeId);
  if (!ScrapingJob) throw new Error(`Scrape ${scrapeId} not found`);
  ScrapingJob.status = "finished";
  ScrapingJob.endTime = new Date();
  await ScrapingJob.save();
};
