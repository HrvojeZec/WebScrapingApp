import { mongo } from "mongoose";
import { CATEGORY_SLUGS } from "@storeseeker/shared";
import type { ScrapeJobDocument } from "../db/models/scrape-job";
import { ScheduleState } from "../db/models/schedule-state";
import { enqueueCategoriesJob, findActiveJobCovering } from "./queue";

/** Local hours of the worker's computer when every category is crawled. */
export const CRAWL_HOURS = [7, 19] as const;
const DUPLICATE_KEY = 11_000;

/** The latest slot at or before `now`, in local time, so it stays 7:00 across daylight saving. */
export function latestSlot(now: Date, hours: readonly number[]): Date {
  const latestFirst = [...hours].sort((a, b) => b - a);
  for (let daysBack = 0; daysBack <= 1; daysBack += 1) {
    for (const hour of latestFirst) {
      const slot = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBack, hour);
      if (slot.getTime() <= now.getTime()) return slot;
    }
  }
  throw new Error("hours must not be empty");
}

// Moves the state to `slot` only if it was older, in one write, so two calls cannot both win
async function claimSlot(slot: Date): Promise<boolean> {
  try {
    const result = await ScheduleState.updateOne(
      { _id: "categories", lastSlotAt: { $lt: slot } },
      { $set: { lastSlotAt: slot } },
      { upsert: true },
    );
    return result.modifiedCount + result.upsertedCount > 0;
  } catch (error) {
    // The state exists and is already at this slot: the upsert tried to insert a second one
    if (error instanceof mongo.MongoServerError && error.code === DUPLICATE_KEY) return false;
    throw error;
  }
}

/** One scheduled job per due slot, however many slots a stopped worker missed. */
export async function enqueueScheduledIfDue(now: Date): Promise<ScrapeJobDocument | null> {
  if (!(await claimSlot(latestSlot(now, CRAWL_HOURS)))) return null;
  const categories = [...CATEGORY_SLUGS];
  if (await findActiveJobCovering(categories)) return null;
  return enqueueCategoriesJob({ source: "schedule", categories, now });
}
