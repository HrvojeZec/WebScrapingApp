import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { JOB_KINDS } from "@storeseeker/shared";

// The last schedule slot that got a job, so a restarted worker adds one catch-up job, not many
const scheduleStateSchema = new Schema({
  _id: { type: String, enum: JOB_KINDS, required: true },
  lastSlotAt: { type: Date, required: true },
});

export type ScheduleStateFields = InferSchemaType<typeof scheduleStateSchema>;
export type ScheduleStateDocument = HydratedDocument<ScheduleStateFields>;
export const ScheduleState = model("ScheduleState", scheduleStateSchema);
