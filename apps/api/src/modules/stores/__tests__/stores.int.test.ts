import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import type { CrawlStatus } from "@storeseeker/shared";
import { createApp } from "../../../app";
import { CrawlRun } from "../../../db/models/crawl-run";
import { createLogger } from "../../../http/logger";
import { insertStore } from "../../../test/factories";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../../test/mongo";

const app = createApp({ clientUrl: "http://localhost:5173", logger: createLogger("silent") });

async function addRun(storeSlug: "demo-a" | "demo-b", status: CrawlStatus, finishedAt: string) {
  await CrawlRun.create({
    storeSlug,
    category: "mobiteli",
    status,
    pages: 1,
    products: 10,
    startedAt: new Date(new Date(finishedAt).getTime() - 60_000),
    finishedAt: new Date(finishedAt),
  });
}

describe("GET /api/stores", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);
  beforeEach(clearDatabase);

  test("lists only enabled stores", async () => {
    await insertStore("demo-a");
    await insertStore("demo-b", false);
    const res = await request(app).get("/api/stores");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        slug: "demo-a",
        name: "Demo trgovina A",
        baseUrl: "https://demo-a.example",
        lastCrawledAt: null,
        lastRunStatus: null,
      },
    ]);
  });

  test("lastCrawledAt comes from the last usable run, lastRunStatus from the last run", async () => {
    await insertStore("demo-a");
    await addRun("demo-a", "partial", "2026-11-24T06:00:00.000Z");
    await addRun("demo-a", "ok", "2026-11-24T18:00:00.000Z");
    await addRun("demo-a", "blocked", "2026-11-25T06:00:00.000Z");
    const res = await request(app).get("/api/stores");
    expect(res.body[0]).toMatchObject({
      lastCrawledAt: "2026-11-24T18:00:00.000Z",
      lastRunStatus: "blocked",
    });
  });

  test("runs of another store do not count", async () => {
    await insertStore("demo-a");
    await insertStore("demo-b");
    await addRun("demo-b", "ok", "2026-11-25T06:00:00.000Z");
    const res = await request(app).get("/api/stores");
    expect(res.body.map((store: { slug: string }) => store.slug)).toEqual(["demo-a", "demo-b"]);
    expect(res.body[0]).toMatchObject({ lastCrawledAt: null, lastRunStatus: null });
    expect(res.body[1]).toMatchObject({ lastRunStatus: "ok" });
  });
});
