import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import type { CategorySlug } from "@storeseeker/shared";
import { CrawlRun } from "../../db/models/crawl-run";
import { Product } from "../../db/models/product";
import { ScrapeJob } from "../../db/models/scrape-job";
import { Store } from "../../db/models/store";
import { systemClock } from "../../scraping/http/clock";
import type { PageSource } from "../../scraping/page-source";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../test/mongo";
import { claimNextJob, enqueueCategoriesJob } from "../queue";
import { runCategoriesJob } from "../run-categories-job";
import { fakeAdapter, fakeSource, pageUrl, product, type FakeAnswer } from "./fakes";

const PHONES = pageUrl("phones");
const LAPTOPS = pageUrl("laptops");
const adapter = fakeAdapter({ mobiteli: [PHONES], laptopi: [LAPTOPS] });

async function runJob(
  categories: CategorySlug[],
  answers: Record<string, FakeAnswer>,
  categoryTimeoutMs?: number,
) {
  await enqueueCategoriesJob({ source: "request", categories, now: new Date() });
  const job = (await claimNextJob(new Date()))!;
  const { source, calls } = fakeSource(answers);
  await runCategoriesJob(
    job,
    {
      sources: { http: source },
      adapters: { harveynorman: adapter },
      clock: systemClock,
      categoryTimeoutMs,
    },
    new AbortController().signal,
  );
  return { job: (await ScrapeJob.findById(job._id).lean())!, calls };
}

async function availability() {
  const products = await Product.find({}, { externalId: 1, available: 1 })
    .sort({ externalId: 1 })
    .lean();
  return Object.fromEntries(products.map((p) => [p.externalId, p.available]));
}

describe("runCategoriesJob", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);
  beforeEach(async () => {
    await clearDatabase();
    await Store.create({
      slug: "harveynorman",
      name: "Harvey Norman",
      baseUrl: "https://shop.example",
    });
  });

  test("crawls every category of the job and saves products with their category", async () => {
    const { job } = await runJob(["mobiteli", "laptopi"], {
      [PHONES]: { items: [product("1")], next: null },
      [LAPTOPS]: { items: [product("2"), product("3")], next: null },
    });
    expect(job).toMatchObject({ status: "succeeded", finishedAt: expect.any(Date) });
    expect(job.perStore[0]).toMatchObject({ status: "ok", pages: 2, products: 3, error: null });
    const runs = await CrawlRun.find().sort({ category: 1 }).lean();
    expect(runs.map((run) => [run.category, run.status, run.products])).toEqual([
      ["laptopi", "ok", 2],
      ["mobiteli", "ok", 1],
    ]);
    expect(runs[0]?.jobId).toEqual(job._id);
    const laptop = await Product.findOne({ externalId: "2" }).lean();
    expect(laptop?.categories).toEqual(["laptopi"]);
  });

  test("a blocked shop is not asked for its other categories", async () => {
    const { job, calls } = await runJob(["mobiteli", "laptopi"], {
      [PHONES]: { kind: "blocked", status: 403, reason: "forbidden" },
      [LAPTOPS]: { items: [product("2")], next: null },
    });
    expect(calls).toEqual([PHONES]);
    expect(job.perStore[0]?.status).toBe("blocked");
    expect(job.status).toBe("failed");
    expect(await CrawlRun.countDocuments()).toBe(1);
  });

  test("a partial crawl delists nothing, and the next complete one does", async () => {
    await runJob(["mobiteli"], { [PHONES]: { items: [product("1"), product("2")], next: null } });
    await ScrapeJob.deleteMany({});

    const partial = await runJob(["mobiteli"], {
      [PHONES]: { items: [product("1")], next: pageUrl("phones", 2) },
      [pageUrl("phones", 2)]: { kind: "error", message: "HTTP 500" },
    });
    expect(partial.job.status).toBe("partial");
    expect(await availability()).toEqual({ 1: true, 2: true });
    await ScrapeJob.deleteMany({});

    await runJob(["mobiteli"], { [PHONES]: { items: [product("1")], next: null } });
    expect(await availability()).toEqual({ 1: true, 2: false });
  });

  test("a first page without products is an error and changes no product", async () => {
    await runJob(["mobiteli"], { [PHONES]: { items: [product("1")], next: null } });
    await ScrapeJob.deleteMany({});

    const { job } = await runJob(["mobiteli"], { [PHONES]: { items: [], next: null } });
    expect(job.perStore[0]).toMatchObject({ status: "error", error: "no products parsed" });
    expect(job.status).toBe("failed");
    expect(await availability()).toEqual({ 1: true });
  });

  test("a category that hangs ends with a timeout and the job still finishes", async () => {
    const { job } = await runJob(
      ["mobiteli", "laptopi"],
      { [PHONES]: "hang", [LAPTOPS]: "hang" },
      50,
    );
    expect(job.perStore[0]).toMatchObject({ status: "error", error: "timeout" });
    expect(job.finishedAt).toBeInstanceOf(Date);
    const runs = await CrawlRun.find().lean();
    expect(runs.map((run) => [run.status, run.error])).toEqual([
      ["error", "timeout"],
      ["error", "timeout"],
    ]);
  });

  test("a shop switched off after the job was queued gets an error", async () => {
    await enqueueCategoriesJob({ source: "request", categories: ["mobiteli"], now: new Date() });
    await Store.updateOne({ slug: "harveynorman" }, { enabled: false });
    const job = (await claimNextJob(new Date()))!;
    const { source, calls } = fakeSource({});
    await runCategoriesJob(
      job,
      { sources: { http: source }, adapters: { harveynorman: adapter }, clock: systemClock },
      new AbortController().signal,
    );
    const saved = await ScrapeJob.findById(job._id).lean();
    expect(saved?.perStore[0]).toMatchObject({ status: "error", error: "store disabled" });
    expect(calls).toEqual([]);
  });

  test("a stop that comes between two categories ends the job before the next one", async () => {
    await enqueueCategoriesJob({
      source: "request",
      categories: ["mobiteli", "laptopi"],
      now: new Date(),
    });
    const job = (await claimNextJob(new Date()))!;
    const controller = new AbortController();
    const calls: string[] = [];
    // The stop arrives while the first category's page is already on its way back
    const source: PageSource = {
      get(url) {
        calls.push(url);
        controller.abort(new Error("worker stopped"));
        return Promise.resolve({
          kind: "ok",
          status: 200,
          url,
          html: JSON.stringify({ items: [product("1")], next: null }),
        });
      },
    };
    await expect(
      runCategoriesJob(
        job,
        { sources: { http: source }, adapters: { harveynorman: adapter }, clock: systemClock },
        controller.signal,
      ),
    ).rejects.toThrow("worker stopped");
    expect(calls).toEqual([PHONES]);
  });
});
