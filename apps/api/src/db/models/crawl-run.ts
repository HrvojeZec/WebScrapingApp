import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { CATEGORY_SLUGS, CRAWL_STATUSES, STORE_SLUGS } from "@storeseeker/shared";

const RUN_TTL_SECONDS = 90 * 24 * 60 * 60;

// One crawl of one category of one store; tells when a category was last refreshed
const crawlRunSchema = new Schema({
  storeSlug: { type: String, enum: STORE_SLUGS, required: true },
  category: { type: String, enum: CATEGORY_SLUGS, required: true },
  jobId: { type: Schema.Types.ObjectId, ref: "ScrapeJob" },
  status: { type: String, enum: CRAWL_STATUSES, required: true },
  pages: { type: Number, required: true },
  products: { type: Number, required: true },
  error: { type: String, default: null },
  startedAt: { type: Date, required: true },
  finishedAt: { type: Date, required: true },
});

crawlRunSchema.index({ finishedAt: 1 }, { expireAfterSeconds: RUN_TTL_SECONDS });
crawlRunSchema.index({ storeSlug: 1, category: 1, finishedAt: -1 });

export type CrawlRunFields = InferSchemaType<typeof crawlRunSchema>;
export type CrawlRunDocument = HydratedDocument<CrawlRunFields>;
export const CrawlRun = model("CrawlRun", crawlRunSchema);
