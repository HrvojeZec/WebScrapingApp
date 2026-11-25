import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import {
  CATEGORY_SLUGS,
  JOB_KINDS,
  JOB_SOURCES,
  JOB_STATUSES,
  STORE_JOB_STATUSES,
  STORE_SLUGS,
} from "@storeseeker/shared";

const JOB_TTL_SECONDS = 30 * 24 * 60 * 60;

const storeJobSchema = new Schema(
  {
    storeSlug: { type: String, enum: STORE_SLUGS, required: true },
    status: { type: String, enum: STORE_JOB_STATUSES, required: true },
    pages: { type: Number, required: true, default: 0 },
    products: { type: Number, required: true, default: 0 },
    error: { type: String, default: null },
  },
  { _id: false },
);

const scrapeJobSchema = new Schema({
  kind: { type: String, enum: JOB_KINDS, required: true },
  source: { type: String, enum: JOB_SOURCES, required: true },
  // Lower runs first: a user's "Osvježi cijene" (0) goes ahead of the schedule (1)
  priority: { type: Number, required: true },
  categories: { type: [{ type: String, enum: CATEGORY_SLUGS }], default: [] },
  status: { type: String, enum: JOB_STATUSES, required: true, default: "queued" },
  perStore: { type: [storeJobSchema], default: [] },
  error: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
  startedAt: { type: Date },
  finishedAt: { type: Date },
});

scrapeJobSchema.index({ createdAt: 1 }, { expireAfterSeconds: JOB_TTL_SECONDS });
scrapeJobSchema.index({ status: 1, priority: 1, createdAt: 1 });

export type ScrapeJobFields = InferSchemaType<typeof scrapeJobSchema>;
export type ScrapeJobDocument = HydratedDocument<ScrapeJobFields>;
export const ScrapeJob = model("ScrapeJob", scrapeJobSchema);
