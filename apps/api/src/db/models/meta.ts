import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

// One document per fact about the database itself; "dataset" marks a database filled by the seed
const metaSchema = new Schema({
  _id: { type: String, required: true },
  demo: { type: Boolean, required: true },
  seededAt: { type: Date, required: true },
});

export type MetaFields = InferSchemaType<typeof metaSchema>;
export type MetaDocument = HydratedDocument<MetaFields>;
export const Meta = model("Meta", metaSchema);
