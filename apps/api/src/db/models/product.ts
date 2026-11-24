import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { STORE_SLUGS } from "@storeseeker/shared";

// No description: only the data needed to compare prices is kept (#50)
const productSchema = new Schema({
  storeSlug: { type: String, enum: STORE_SLUGS, required: true },
  externalId: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  imageUrl: { type: String, default: null },
  priceCents: { type: Number, required: true },
  regularPriceCents: { type: Number, default: null },
  discountPercent: { type: Number, required: true, default: 0 },
  currency: { type: String, enum: ["EUR"], required: true, default: "EUR" },
  available: { type: Boolean, required: true },
  ean: { type: String },
  previousPriceCents: { type: Number },
  priceChangedAt: { type: Date },
  firstSeenAt: { type: Date, required: true },
  lastSeenAt: { type: Date, required: true },
});

productSchema.index({ storeSlug: 1, externalId: 1 }, { unique: true });
// MongoDB has no Croatian stemmer, and English stemming would mangle Croatian words
productSchema.index({ title: "text" }, { default_language: "none" });
productSchema.index({ ean: 1 }, { sparse: true });
productSchema.index({ priceChangedAt: -1 });
productSchema.index({ discountPercent: -1 });

export type ProductFields = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<ProductFields>;
export const Product = model("Product", productSchema);
