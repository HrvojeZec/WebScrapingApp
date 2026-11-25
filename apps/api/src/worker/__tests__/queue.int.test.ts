import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { ScrapeJob } from "../../db/models/scrape-job";
import { Store } from "../../db/models/store";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../test/mongo";
import {
  claimNextJob,
  enqueueCategoriesJob,
  findActiveJobCovering,
  queuePosition,
  requeueRunningJobs,
} from "../queue";

const NOW = new Date("2026-11-25T10:00:00Z");
const later = (seconds: number) => new Date(NOW.getTime() + seconds * 1000);
const ALL = ["mobiteli", "laptopi", "televizori", "tableti", "slusalice"] as const;

async function addShop(enabled = true) {
  await Store.create({
    slug: "harveynorman",
    name: "Harvey Norman",
    baseUrl: "https://www.harveynorman.hr",
    enabled,
  });
}

describe("job queue", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);
  beforeEach(clearDatabase);

  test("a user's request goes ahead of an earlier scheduled job", async () => {
    await addShop();
    await enqueueCategoriesJob({ source: "schedule", categories: [...ALL], now: NOW });
    const request = await enqueueCategoriesJob({
      source: "request",
      categories: ["mobiteli"],
      now: later(1),
    });
    const claimed = await claimNextJob(later(2));
    expect(claimed?._id).toEqual(request?._id);
    expect(claimed).toMatchObject({ status: "running", startedAt: later(2) });
  });

  test("two workers claiming at once get the job only once", async () => {
    await addShop();
    await enqueueCategoriesJob({ source: "request", categories: ["mobiteli"], now: NOW });
    const claims = await Promise.all([claimNextJob(later(1)), claimNextJob(later(1))]);
    expect(claims.filter((job) => job !== null)).toHaveLength(1);
  });

  test("the queue position counts the running job and the queued jobs ahead", async () => {
    await addShop();
    const running = await enqueueCategoriesJob({
      source: "schedule",
      categories: [...ALL],
      now: NOW,
    });
    await claimNextJob(later(1));
    await enqueueCategoriesJob({ source: "request", categories: ["laptopi"], now: later(2) });
    await enqueueCategoriesJob({ source: "request", categories: ["tableti"], now: later(3) });
    const mine = await enqueueCategoriesJob({
      source: "request",
      categories: ["slusalice"],
      now: later(4),
    });
    const done = await ScrapeJob.create({
      kind: "categories",
      source: "request",
      priority: 0,
      categories: ["mobiteli"],
      status: "succeeded",
      createdAt: NOW,
    });

    expect(await queuePosition(mine!)).toBe(3);
    expect(await queuePosition((await ScrapeJob.findById(running!._id))!)).toBeNull();
    expect(await queuePosition(done)).toBeNull();
  });

  test("only enabled shops get a part of the job", async () => {
    await addShop(false);
    expect(
      await enqueueCategoriesJob({ source: "request", categories: ["mobiteli"], now: NOW }),
    ).toBeNull();

    await Store.updateOne({ slug: "harveynorman" }, { enabled: true });
    const job = await enqueueCategoriesJob({
      source: "request",
      categories: ["mobiteli"],
      now: NOW,
    });
    expect(job?.perStore.map((part) => [part.storeSlug, part.status])).toEqual([
      ["harveynorman", "pending"],
    ]);
    expect(job).toMatchObject({ priority: 0, status: "queued", categories: ["mobiteli"] });
  });

  test("an active job covers the categories it contains, and only those", async () => {
    await addShop();
    const all = await enqueueCategoriesJob({ source: "schedule", categories: [...ALL], now: NOW });
    expect((await findActiveJobCovering(["laptopi"]))?._id).toEqual(all?._id);

    await ScrapeJob.deleteMany({});
    await enqueueCategoriesJob({ source: "request", categories: ["mobiteli"], now: NOW });
    expect(await findActiveJobCovering(["laptopi"])).toBeNull();
    expect(await findActiveJobCovering(["mobiteli", "laptopi"])).toBeNull();
  });

  test("a job left running by a stopped worker goes back to the queue", async () => {
    await addShop();
    const job = await enqueueCategoriesJob({
      source: "request",
      categories: ["mobiteli"],
      now: NOW,
    });
    await claimNextJob(later(1));
    await ScrapeJob.updateOne(
      { _id: job!._id },
      { $set: { "perStore.0.status": "running", "perStore.0.pages": 4, "perStore.0.error": "x" } },
    );

    expect(await requeueRunningJobs()).toBe(1);
    const requeued = await ScrapeJob.findById(job!._id).lean();
    expect(requeued?.status).toBe("queued");
    expect(requeued?.startedAt).toBeUndefined();
    expect(requeued?.perStore[0]).toMatchObject({
      status: "pending",
      pages: 0,
      products: 0,
      error: null,
    });
  });
});
