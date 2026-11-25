import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { CATEGORY_SLUGS, type CategorySlug, type CrawlStatus } from "@storeseeker/shared";
import { createApp } from "../../../app";
import { CrawlRun } from "../../../db/models/crawl-run";
import { ScrapeJob } from "../../../db/models/scrape-job";
import { Store } from "../../../db/models/store";
import { createLogger } from "../../../http/logger";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../../test/mongo";
import { recordHeartbeat } from "../../../worker/heartbeat";

const CLIENT_URL = "http://localhost:5173";
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
// 11:00 in Zagreb (CET)
const NOW = new Date("2026-11-25T10:00:00Z");

let now: Date;
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * MINUTE_MS);

function buildApp(refreshLimit = { max: 3, windowMs: HOUR_MS }) {
  return createApp({
    clientUrl: CLIENT_URL,
    logger: createLogger("silent"),
    now: () => now,
    refreshLimit,
  });
}

async function addShop(enabled = true) {
  await Store.create({
    slug: "harveynorman",
    name: "Harvey Norman",
    baseUrl: "https://www.harveynorman.hr",
    enabled,
  });
}

async function addRuns(
  finishedAt: Date,
  categories: readonly CategorySlug[] = CATEGORY_SLUGS,
  status: CrawlStatus = "ok",
) {
  await CrawlRun.insertMany(
    categories.map((category) => ({
      storeSlug: "harveynorman",
      category,
      status,
      pages: 1,
      products: 10,
      startedAt: new Date(finishedAt.getTime() - MINUTE_MS),
      finishedAt,
    })),
  );
}

const finishAllJobs = () => ScrapeJob.updateMany({}, { $set: { status: "succeeded" } });

describe("scrape jobs API", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);
  beforeEach(async () => {
    await clearDatabase();
    now = NOW;
  });

  describe("POST /api/scrapes", () => {
    test("over an empty database queues a job for every category of the enabled shop", async () => {
      await addShop();
      const res = await request(buildApp()).post("/api/scrapes").send({});
      expect(res.status).toBe(202);
      expect(res.body).toEqual({
        fresh: false,
        job: {
          id: expect.stringMatching(/^[a-f0-9]{24}$/),
          kind: "categories",
          source: "request",
          status: "queued",
          categories: [...CATEGORY_SLUGS],
          perStore: [
            { storeSlug: "harveynorman", status: "pending", pages: 0, products: 0, error: null },
          ],
          createdAt: NOW.toISOString(),
          startedAt: null,
          finishedAt: null,
          queuePosition: 0,
          workerOnline: false,
        },
      });
    });

    test("a request without a body means every category", async () => {
      await addShop();
      const res = await request(buildApp()).post("/api/scrapes");
      expect(res.status).toBe(202);
      expect(res.body.job.categories).toEqual([...CATEGORY_SLUGS]);
    });

    test("a second request while the job is queued returns the same job and costs no limit", async () => {
      await addShop();
      const app = buildApp({ max: 1, windowMs: HOUR_MS });
      const first = await request(app).post("/api/scrapes").send({});
      const second = await request(app).post("/api/scrapes").send({});
      expect(second.status).toBe(202);
      expect(second.body.job.id).toBe(first.body.job.id);
      expect(await ScrapeJob.countDocuments()).toBe(1);

      // max 1: had the second request counted, this one would be refused
      await finishAllJobs();
      now = new Date(NOW.getTime() + MINUTE_MS);
      const third = await request(app).post("/api/scrapes").send({});
      expect(third.status).toBe(429);
    });

    test("two requests at the same moment queue one job", async () => {
      await addShop();
      const app = buildApp();
      const [first, second] = await Promise.all([
        request(app).post("/api/scrapes").send({}),
        request(app).post("/api/scrapes").send({}),
      ]);
      expect(second.body.job.id).toBe(first.body.job.id);
      expect(await ScrapeJob.countDocuments()).toBe(1);
    });

    test("a request for one category returns an active job that covers every category", async () => {
      await addShop();
      const app = buildApp();
      const all = await request(app).post("/api/scrapes").send({});
      const laptops = await request(app)
        .post("/api/scrapes")
        .send({ categories: ["laptopi"] });
      expect(laptops.status).toBe(202);
      expect(laptops.body.job.id).toBe(all.body.job.id);
    });

    test("a request for every category does not reuse a job for one category", async () => {
      await addShop();
      const app = buildApp();
      const laptops = await request(app)
        .post("/api/scrapes")
        .send({ categories: ["laptopi"] });
      const all = await request(app).post("/api/scrapes").send({});
      expect(all.status).toBe(202);
      expect(all.body.job.id).not.toBe(laptops.body.job.id);
      expect(all.body.job.queuePosition).toBe(1);
    });

    test("categories crawled 10 minutes ago are fresh and queue nothing", async () => {
      await addShop();
      await addRuns(minutesAgo(10));
      await addRuns(minutesAgo(25), ["laptopi"], "partial");
      const res = await request(buildApp()).post("/api/scrapes").send({});
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ fresh: true, lastCrawledAt: minutesAgo(10).toISOString() });
      expect(await ScrapeJob.countDocuments()).toBe(0);
    });

    test("the oldest of the latest crawls is the one reported", async () => {
      await addShop();
      await addRuns(minutesAgo(5), ["mobiteli"]);
      await addRuns(minutesAgo(20), ["laptopi"], "partial");
      const res = await request(buildApp())
        .post("/api/scrapes")
        .send({ categories: ["mobiteli", "laptopi"] });
      expect(res.status).toBe(200);
      expect(res.body.lastCrawledAt).toBe(minutesAgo(20).toISOString());
    });

    test("categories crawled 31 minutes ago are refreshed", async () => {
      await addShop();
      await addRuns(minutesAgo(31));
      const res = await request(buildApp()).post("/api/scrapes").send({});
      expect(res.status).toBe(202);
      expect(res.body.fresh).toBe(false);
    });

    test("one stale category among fresh ones queues a job", async () => {
      await addShop();
      await addRuns(minutesAgo(10), ["mobiteli", "laptopi", "televizori", "tableti"]);
      const res = await request(buildApp()).post("/api/scrapes").send({});
      expect(res.status).toBe(202);
    });

    test("a blocked or failed crawl does not make a category fresh", async () => {
      await addShop();
      await addRuns(minutesAgo(5), ["mobiteli"], "blocked");
      await addRuns(minutesAgo(5), ["laptopi"], "error");
      for (const category of ["mobiteli", "laptopi"] as const) {
        const res = await request(buildApp())
          .post("/api/scrapes")
          .send({ categories: [category] });
        expect(res.status).toBe(202);
      }
    });

    test("the fourth new job from one IP within an hour gets 429 with resetAt", async () => {
      await addShop();
      const app = buildApp();
      for (let i = 0; i < 3; i++) {
        now = new Date(NOW.getTime() + i * MINUTE_MS);
        const res = await request(app).post("/api/scrapes").send({});
        expect(res.status).toBe(202);
        await finishAllJobs();
      }
      now = new Date(NOW.getTime() + 3 * MINUTE_MS);
      const res = await request(app).post("/api/scrapes").send({});
      expect(res.status).toBe(429);
      expect(res.body).toEqual({
        error: {
          code: "rate_limited",
          message: "Cijene si nedavno osvježio. Pokušaj ponovo nakon 12:00.",
          resetAt: new Date(NOW.getTime() + HOUR_MS).toISOString(),
        },
      });
      expect(await ScrapeJob.countDocuments()).toBe(3);

      now = new Date(NOW.getTime() + HOUR_MS);
      expect((await request(app).post("/api/scrapes").send({})).status).toBe(202);
    });

    test("with the only shop switched off it answers 409 no_shops", async () => {
      await addShop(false);
      const res = await request(buildApp()).post("/api/scrapes").send({});
      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        error: { code: "no_shops", message: "Nijedna trgovina trenutno nije uključena." },
      });
      expect(await ScrapeJob.countDocuments()).toBe(0);
    });

    test("crawls of a switched-off shop do not count as fresh", async () => {
      await addShop(false);
      await addRuns(minutesAgo(5));
      const res = await request(buildApp()).post("/api/scrapes").send({});
      expect(res.status).toBe(409);
    });

    test.each([
      ["an unknown category", { categories: ["auti"] }],
      ["an empty list", { categories: [] }],
      ["a string instead of a list", { categories: "mobiteli" }],
      ["a repeated category", { categories: ["mobiteli", "mobiteli"] }],
    ])("%s gives 400 validation_error", async (_name, body) => {
      await addShop();
      const res = await request(buildApp()).post("/api/scrapes").send(body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("validation_error");
      expect(await ScrapeJob.countDocuments()).toBe(0);
    });
  });

  describe("GET /api/scrapes/:id", () => {
    test("an invalid ID gives 400", async () => {
      const res = await request(buildApp()).get("/api/scrapes/abc");
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("validation_error");
    });

    test("an unknown ID gives 404", async () => {
      const res = await request(buildApp()).get("/api/scrapes/0123456789abcdef01234567");
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("not_found");
    });

    test("returns the job without internal fields", async () => {
      const job = await ScrapeJob.create({
        kind: "categories",
        source: "schedule",
        priority: 1,
        categories: ["mobiteli", "laptopi"],
        status: "partial",
        perStore: [
          { storeSlug: "harveynorman", status: "partial", pages: 7, products: 64, error: "x" },
        ],
        createdAt: minutesAgo(30),
        startedAt: minutesAgo(29),
        finishedAt: minutesAgo(20),
      });
      const res = await request(buildApp()).get(`/api/scrapes/${job.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: job.id,
        kind: "categories",
        source: "schedule",
        status: "partial",
        categories: ["mobiteli", "laptopi"],
        perStore: [
          { storeSlug: "harveynorman", status: "partial", pages: 7, products: 64, error: "x" },
        ],
        createdAt: minutesAgo(30).toISOString(),
        startedAt: minutesAgo(29).toISOString(),
        finishedAt: minutesAgo(20).toISOString(),
        queuePosition: null,
        workerOnline: false,
      });
    });

    test("after a heartbeat the job says the worker is online", async () => {
      await addShop();
      const app = buildApp();
      const created = await request(app).post("/api/scrapes").send({});
      await recordHeartbeat(minutesAgo(1));
      const res = await request(app).get(`/api/scrapes/${created.body.job.id}`);
      expect(res.body.workerOnline).toBe(true);
      expect(res.body.queuePosition).toBe(0);
    });
  });
});
