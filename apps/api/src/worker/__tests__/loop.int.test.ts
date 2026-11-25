import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { ScheduleState } from "../../db/models/schedule-state";
import { ScrapeJob } from "../../db/models/scrape-job";
import { Store } from "../../db/models/store";
import { createLogger } from "../../http/logger";
import { systemClock } from "../../scraping/http/clock";
import { connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../test/mongo";
import { startWorker } from "../loop";
import { enqueueCategoriesJob } from "../queue";
import { CRAWL_HOURS, latestSlot } from "../schedule";
import { fakeAdapter, fakeSource, pageUrl } from "./fakes";

async function waitFor(check: () => Promise<boolean>, timeoutMs = 5_000) {
  const until = Date.now() + timeoutMs;
  while (!(await check())) {
    if (Date.now() > until) throw new Error("condition not met in time");
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

describe("startWorker", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);

  test("stop() in the middle of a job puts the job back in the queue", async () => {
    await Store.create({
      slug: "harveynorman",
      name: "Harvey Norman",
      baseUrl: "https://shop.example",
    });
    // The current slot is taken, so the loop adds no scheduled job of its own
    await ScheduleState.create({
      _id: "categories",
      lastSlotAt: latestSlot(new Date(), CRAWL_HOURS),
    });
    const job = await enqueueCategoriesJob({
      source: "request",
      categories: ["mobiteli"],
      now: new Date(),
    });

    const phones = pageUrl("phones");
    const { source } = fakeSource({ [phones]: "hang" });
    const worker = startWorker({
      sources: { http: source },
      adapters: { harveynorman: fakeAdapter({ mobiteli: [phones] }) },
      clock: systemClock,
      pollMs: 10,
      logger: createLogger("silent"),
    });

    await waitFor(async () => (await ScrapeJob.findById(job!._id).lean())?.status === "running");
    await worker.stop();

    const requeued = await ScrapeJob.findById(job!._id).lean();
    expect(requeued?.status).toBe("queued");
    expect(requeued?.perStore[0]?.status).toBe("pending");
  });
});
