import type { FilterQuery } from "mongoose";
import { SHOP_SLUGS, type CategorySlug, type JobSource } from "@storeseeker/shared";
import { ScrapeJob, type ScrapeJobDocument, type ScrapeJobFields } from "../db/models/scrape-job";
import { Store } from "../db/models/store";

// Lower runs first: a user waiting on "Osvježi cijene" goes ahead of the schedule
const PRIORITY: Record<JobSource, number> = { request: 0, schedule: 1 };
const ACTIVE = ["queued", "running"] as const;
const QUEUE_ORDER = { priority: 1, createdAt: 1, _id: 1 } as const;

/** A job for the enabled shops, or null when every shop is switched off. */
export async function enqueueCategoriesJob(input: {
  source: JobSource;
  categories: CategorySlug[];
  now: Date;
}): Promise<ScrapeJobDocument | null> {
  const stores = await Store.find({ enabled: true, slug: { $in: SHOP_SLUGS } }, { slug: 1 })
    .sort({ slug: 1 })
    .lean();
  if (stores.length === 0) return null;
  return ScrapeJob.create({
    kind: "categories",
    source: input.source,
    priority: PRIORITY[input.source],
    categories: input.categories,
    status: "queued",
    perStore: stores.map((store) => ({ storeSlug: store.slug, status: "pending" })),
    createdAt: input.now,
  });
}

/** A queued or running job that crawls every one of `categories`. */
export function findActiveJobCovering(
  categories: CategorySlug[],
): Promise<ScrapeJobDocument | null> {
  return ScrapeJob.findOne({ status: { $in: ACTIVE }, categories: { $all: categories } })
    .sort({ createdAt: 1 })
    .exec();
}

/** Atomic, so two workers can never take the same job. */
export function claimNextJob(now: Date): Promise<ScrapeJobDocument | null> {
  return ScrapeJob.findOneAndUpdate(
    { status: "queued" },
    { $set: { status: "running", startedAt: now } },
    { sort: QUEUE_ORDER, new: true },
  ).exec();
}

export async function requeueJobs(filter: FilterQuery<ScrapeJobFields> = {}): Promise<number> {
  const result = await ScrapeJob.updateMany(
    { ...filter, status: "running" },
    {
      $set: {
        status: "queued",
        "perStore.$[].status": "pending",
        "perStore.$[].pages": 0,
        "perStore.$[].products": 0,
        "perStore.$[].error": null,
      },
      $unset: { startedAt: 1 },
    },
  );
  return result.modifiedCount;
}

/** There is one worker, so a job still running when it starts was left by a stopped process. */
export function requeueRunningJobs(): Promise<number> {
  return requeueJobs();
}

/** How many jobs run before this one: the running one plus the queued ones ahead of it. */
export async function queuePosition(job: ScrapeJobDocument): Promise<number | null> {
  const current = await ScrapeJob.findById(job._id, {
    status: 1,
    priority: 1,
    createdAt: 1,
  }).lean();
  if (current?.status !== "queued") return null;
  const { priority, createdAt, _id } = current;
  const [running, ahead] = await Promise.all([
    ScrapeJob.countDocuments({ status: "running" }),
    ScrapeJob.countDocuments({
      status: "queued",
      $or: [
        { priority: { $lt: priority } },
        { priority, createdAt: { $lt: createdAt } },
        { priority, createdAt, _id: { $lt: _id } },
      ],
    }),
  ]);
  return running + ahead;
}
