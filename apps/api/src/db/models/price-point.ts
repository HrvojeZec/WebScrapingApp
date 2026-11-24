import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

// Written only when the price changes (and on first sight), not on every scrape
const pricePointSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  priceCents: { type: Number, required: true },
  regularPriceCents: { type: Number, default: null },
  observedAt: { type: Date, required: true },
});

pricePointSchema.index({ productId: 1, observedAt: 1 });

export type PricePointFields = InferSchemaType<typeof pricePointSchema>;
export type PricePointDocument = HydratedDocument<PricePointFields>;
export const PricePoint = model("PricePoint", pricePointSchema);
