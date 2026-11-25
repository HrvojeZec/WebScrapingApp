import mongoose from "mongoose";
import { CrawlRun } from "../db/models/crawl-run";
import { Meta } from "../db/models/meta";
import { PricePoint } from "../db/models/price-point";
import { Product } from "../db/models/product";
import "../db/models/schedule-state";
import "../db/models/scrape-job";
import { Store } from "../db/models/store";
import { buildDemoDataset } from "./demo-dataset";

/** The seed writes only here, whatever database the URI names. */
export const DEMO_DB_NAME = "storeseeker-demo";

/** Replaces everything in the current database with the demo dataset. */
export async function seedDemo(today: Date): Promise<{ products: number; pricePoints: number }> {
  const dataset = buildDemoDataset(today);

  // Every registered model, so leftovers such as jobs never mix with the demo data
  await Promise.all(Object.values(mongoose.models).map((model) => model.deleteMany({})));
  await mongoose.connection.syncIndexes();

  await Store.insertMany(dataset.stores);
  await Product.insertMany(dataset.products);
  await PricePoint.insertMany(dataset.pricePoints);
  await CrawlRun.insertMany(dataset.crawlRuns);
  await Meta.create({ _id: "dataset", demo: true, seededAt: today });

  return { products: dataset.products.length, pricePoints: dataset.pricePoints.length };
}
