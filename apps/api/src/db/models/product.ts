import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { CATEGORY_SLUGS, STORE_SLUGS } from "@storeseeker/shared";

// No description: only the data needed to compare prices is kept (#50)
const productSchema = new Schema({
  storeSlug: { type: String, enum: STORE_SLUGS, required: true },
  externalId: { type: String, required: true },
  title: { type: String, required: true },
  // The title without diacritics (toSearchText), so "slusalice" finds "Slušalice"
  searchText: { type: String, required: true },
  // Where the store lists it right now; a product with none left is unavailable
  categories: { type: [{ type: String, enum: CATEGORY_SLUGS }], default: [] },
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
productSchema.index({ ean: 1 }, { sparse: true });
productSchema.index({ categories: 1, priceCents: 1 });
productSchema.index({ discountPercent: -1 });

export type ProductFields = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<ProductFields>;
export const Product = model("Product", productSchema);
