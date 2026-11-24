import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { FETCH_METHODS, JOB_STATUSES, STORE_RUN_STATUSES, STORE_SLUGS } from "@storeseeker/shared";

const JOB_TTL_SECONDS = 30 * 24 * 60 * 60;

// Mirrors StoreRunDto from @storeseeker/shared
const storeRunSchema = new Schema(
  {
    storeSlug: { type: String, enum: STORE_SLUGS, required: true },
    status: { type: String, enum: STORE_RUN_STATUSES, required: true },
    method: { type: String, enum: FETCH_METHODS, required: true },
    count: { type: Number, required: true },
    error: { type: String, default: null },
  },
  { _id: false },
);

const scrapeJobSchema = new Schema({
  keyword: { type: String, required: true },
  status: { type: String, enum: JOB_STATUSES, required: true, default: "queued" },
  perStore: { type: [storeRunSchema], default: [] },
  // "ip:<hash>" in v0.3, "user:<id>" once accounts exist (#28)
  requester: { type: String, required: true },
  error: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
  startedAt: { type: Date },
  finishedAt: { type: Date },
});

scrapeJobSchema.index({ createdAt: 1 }, { expireAfterSeconds: JOB_TTL_SECONDS });
scrapeJobSchema.index({ status: 1, createdAt: 1 });
scrapeJobSchema.index({ requester: 1, status: 1 });
scrapeJobSchema.index({ keyword: 1, status: 1 });

export type ScrapeJobFields = InferSchemaType<typeof scrapeJobSchema>;
export type ScrapeJobDocument = HydratedDocument<ScrapeJobFields>;
export const ScrapeJob = model("ScrapeJob", scrapeJobSchema);
