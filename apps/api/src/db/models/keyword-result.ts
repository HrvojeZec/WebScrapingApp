import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { STORE_SLUGS } from "@storeseeker/shared";

const keywordResultSchema = new Schema({
  keyword: { type: String, required: true },
  storeSlug: { type: String, enum: STORE_SLUGS, required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  rank: { type: Number, required: true },
  seenAt: { type: Date, required: true },
});

keywordResultSchema.index({ keyword: 1, productId: 1 }, { unique: true });
keywordResultSchema.index({ keyword: 1, storeSlug: 1, seenAt: 1 });

export type KeywordResultFields = InferSchemaType<typeof keywordResultSchema>;
export type KeywordResultDocument = HydratedDocument<KeywordResultFields>;
export const KeywordResult = model("KeywordResult", keywordResultSchema);
