import express, { NextFunction, Request, Response } from "express";
import axios from "axios";
import { env } from "../../config";
import { parseKeyword } from "../scrapeExecute/keyword";
import { CustomInternalServerError } from "../../middleware/CustomError";
import { createNewScrape, endScrapeStatus } from "./scrape-service";
const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  // Validate before creating the job: the executor rejects a non-string keyword, and the job would
  // then stay "started" forever
  const keyword = parseKeyword((req.body || {}).keyword);
  if (keyword === null) {
    return res.status(400).json({ error: "Ključna riječ mora biti neprazan tekst." });
  }
  try {
    const response = await createNewScrape(keyword);

    res.status(200).json(response.newScrapingJob._id);
    const scrapeJob = response.newScrapingJob;

    await axios.post(
      env.EXECUTE_URL,
      {
        keyword: keyword,
        newScrapingJob: scrapeJob,
      },
      {
        headers: { Accept: "application/json" },
      },
    );
    await endScrapeStatus(scrapeJob._id);
    console.log(`end scrape status set scrape with id ${scrapeJob._id} on finished!!`);
  } catch (error: unknown) {
    let message = "Nepoznata greška.";
    if (typeof error === "object" && error !== null && "message" in error) {
      message = (error as { message?: string }).message || message;
    }

    next(new CustomInternalServerError(`Nešto je pošlo po krivu: ${message}`));
  } finally {
    console.log("finally!!!!!!!!!!!!!!!!!!!!");
  }
});

export default router;
