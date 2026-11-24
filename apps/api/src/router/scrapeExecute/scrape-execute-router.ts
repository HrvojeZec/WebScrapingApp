import express, { NextFunction, Request, Response } from "express";
import { Error } from "../../types/params";
import { log } from "console";
import { parseKeyword } from "./keyword";
const executeService = require("./scrape-execute-service");
const {
  CustomInternalServerError,
  CustomNotFound,
  CustomMultiStatus,
} = require("../../middleware/CustomError");
const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { newScrapingJob } = req.body;
  const keyword = parseKeyword(req.body.keyword);
  if (keyword === null) {
    return res.status(400).json({ error: "Ključna riječ mora biti neprazan tekst." });
  }

  try {
    const products = await executeService(keyword, newScrapingJob);

    res.status(200).json({ products });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.status === 404) {
      const customError = new CustomNotFound(
        "Nema proizvoda za danu ključnu riječ u obje trgovine.",
      );
      next(customError);
    } else if (err.products) {
      const customError = new CustomMultiStatus(
        ` Neki izvori nisu uspješno scrapani.${err.products}`,
      );
      next(customError);
    } else {
      const customError = new CustomInternalServerError(`Nešto je pošlo po krivu: ${err.message}`);
      next(customError);
    }
  }
});

module.exports = router;
