import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { CATEGORY_SLUGS } from "@storeseeker/shared";
import { ScheduleState } from "../../db/models/schedule-state";
import { ScrapeJob } from "../../db/models/scrape-job";
import { Store } from "../../db/models/store";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../test/mongo";
import { claimNextJob } from "../queue";
import { enqueueScheduledIfDue } from "../schedule";

const MORNING = new Date(2026, 10, 25, 8, 0);

describe("enqueueScheduledIfDue", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);
  beforeEach(async () => {
    await clearDatabase();
    await Store.create({
      slug: "harveynorman",
      name: "Harvey Norman",
      baseUrl: "https://www.harveynorman.hr",
    });
  });

  test("a first run adds one scheduled job for every category", async () => {
    const job = await enqueueScheduledIfDue(MORNING);
    expect(job).toMatchObject({ source: "schedule", priority: 1, categories: [...CATEGORY_SLUGS] });
    expect(await ScrapeJob.countDocuments()).toBe(1);
  });

  test("the same slot does not add a second job", async () => {
    await enqueueScheduledIfDue(MORNING);
    await ScrapeJob.updateMany({}, { status: "succeeded" });
    expect(await enqueueScheduledIfDue(new Date(2026, 10, 25, 9, 30))).toBeNull();
    expect(await ScrapeJob.countDocuments()).toBe(1);
  });

  test("two calls at once add one job", async () => {
    const jobs = await Promise.all([
      enqueueScheduledIfDue(MORNING),
      enqueueScheduledIfDue(MORNING),
    ]);
    expect(jobs.filter((job) => job !== null)).toHaveLength(1);
    expect(await ScrapeJob.countDocuments()).toBe(1);
  });

  test("a worker off for two days adds one catch-up job, not one per missed slot", async () => {
    await enqueueScheduledIfDue(MORNING);
    await ScrapeJob.updateMany({}, { status: "succeeded" });
    expect(await enqueueScheduledIfDue(new Date(2026, 10, 27, 8, 0))).not.toBeNull();
    expect(await ScrapeJob.countDocuments()).toBe(2);
  });

  test("an active job for every category moves the slot without a new job", async () => {
    await enqueueScheduledIfDue(MORNING);
    await claimNextJob(MORNING);
    const evening = new Date(2026, 10, 25, 19, 5);
    expect(await enqueueScheduledIfDue(evening)).toBeNull();
    expect(await ScrapeJob.countDocuments()).toBe(1);
    const state = await ScheduleState.findById("categories").lean();
    expect(state?.lastSlotAt).toEqual(new Date(2026, 10, 25, 19, 0));
  });
});
