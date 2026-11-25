import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

// One document ("worker"): when the home worker last checked in, so the API can say it is offline
const workerStatusSchema = new Schema({
  _id: { type: String, required: true },
  lastSeenAt: { type: Date, required: true },
});

export type WorkerStatusFields = InferSchemaType<typeof workerStatusSchema>;
export type WorkerStatusDocument = HydratedDocument<WorkerStatusFields>;
export const WorkerStatus = model("WorkerStatus", workerStatusSchema);
