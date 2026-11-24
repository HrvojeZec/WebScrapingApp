import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { STORE_RUN_STATUSES, STORE_SLUGS } from "@storeseeker/shared";

const keywordCacheSchema = new Schema({
  keyword: { type: String, required: true, unique: true },
  lastScrapedAt: { type: Date, required: true },
  perStore: {
    type: [
      new Schema(
        {
          storeSlug: { type: String, enum: STORE_SLUGS, required: true },
          status: { type: String, enum: STORE_RUN_STATUSES, required: true },
          count: { type: Number, required: true },
        },
        { _id: false },
      ),
    ],
    default: [],
  },
  totalCount: { type: Number, required: true, default: 0 },
});

export type KeywordCacheFields = InferSchemaType<typeof keywordCacheSchema>;
export type KeywordCacheDocument = HydratedDocument<KeywordCacheFields>;
export const KeywordCache = model("KeywordCache", keywordCacheSchema);
