import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { STORE_SLUGS } from "@storeseeker/shared";

const storeSchema = new Schema({
  slug: { type: String, enum: STORE_SLUGS, required: true, unique: true },
  name: { type: String, required: true },
  baseUrl: { type: String, required: true },
  // A static file in the web app, so no SVG markup is stored or injected into the page
  logoPath: { type: String, required: true },
  enabled: { type: Boolean, required: true, default: true },
});

export type StoreFields = InferSchemaType<typeof storeSchema>;
export type StoreDocument = HydratedDocument<StoreFields>;
export const Store = model("Store", storeSchema);
