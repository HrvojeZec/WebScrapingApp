import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../test/mongo";
import { CrawlRun } from "../models/crawl-run";
import { Product } from "../models/product";
import { ScheduleState } from "../models/schedule-state";
import { ScrapeJob } from "../models/scrape-job";

const SEEN = new Date("2026-11-20T10:00:00Z");
const DAY_SECONDS = 24 * 60 * 60;

const productFields = {
  storeSlug: "harveynorman",
  externalId: "a",
  title: "Apple iPhone",
  searchText: "apple iphone",
  url: "https://www.harveynorman.hr/p/a",
  imageUrl: null,
  priceCents: 100,
  regularPriceCents: null,
  discountPercent: 0,
  available: true,
  firstSeenAt: SEEN,
  lastSeenAt: SEEN,
};

type IndexInfo = { key: Record<string, unknown>; expireAfterSeconds?: number };

async function indexesOf(model: { listIndexes(): Promise<unknown[]> }): Promise<IndexInfo[]> {
  return (await model.listIndexes()) as IndexInfo[];
}

function ttlOn(indexes: IndexInfo[], field: string): number | undefined {
  return indexes.find((index) => Object.keys(index.key).join() === field)?.expireAfterSeconds;
}

beforeAll(async () => {
  await connectMemoryMongoDB();
  await Promise.all(
    [Product, ScrapeJob, CrawlRun, ScheduleState].map((model) => model.syncIndexes()),
  );
});
afterEach(clearDatabase);
afterAll(disconnectMemoryMongoDB);

describe("Product", () => {
  test("rejects a second product with the same store and external ID", async () => {
    await Product.create(productFields);
    await expect(Product.create(productFields)).rejects.toMatchObject({ code: 11000 });
  });

  test("has no description field (#50, minimal data)", () => {
    expect(Product.schema.path("description")).toBeUndefined();
  });

  test("rejects a store that is not in STORE_SLUGS", async () => {
    await expect(Product.create({ ...productFields, storeSlug: "ekupi" })).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  test("needs searchText and defaults categories to an empty list", async () => {
    const { searchText: _searchText, ...withoutSearchText } = productFields;
    await expect(Product.create(withoutSearchText)).rejects.toMatchObject({
      name: "ValidationError",
    });
    expect((await Product.create(productFields)).categories).toEqual([]);
  });

  test("has the category and price index and no text index", async () => {
    const keys = (await indexesOf(Product)).map((index) => index.key);
    expect(keys).toContainEqual({ categories: 1, priceCents: 1 });
    expect(keys.some((key) => Object.values(key).includes("text"))).toBe(false);
  });
});

describe("ScrapeJob", () => {
  test("expires 30 days after createdAt", async () => {
    expect(ttlOn(await indexesOf(ScrapeJob), "createdAt")).toBe(30 * DAY_SECONDS);
  });

  test("starts as a queued job with no stores yet", async () => {
    const job = await ScrapeJob.create({
      kind: "categories",
      source: "request",
      priority: 0,
      categories: ["mobiteli"],
    });
    expect(job.toObject()).toMatchObject({ status: "queued", perStore: [] });
  });

  test("rejects an unknown category", async () => {
    await expect(
      ScrapeJob.create({ kind: "categories", source: "schedule", priority: 1, categories: ["x"] }),
    ).rejects.toMatchObject({ name: "ValidationError" });
  });
});

describe("CrawlRun", () => {
  test("expires 90 days after finishedAt", async () => {
    expect(ttlOn(await indexesOf(CrawlRun), "finishedAt")).toBe(90 * DAY_SECONDS);
  });
});

describe("ScheduleState", () => {
  test("keeps one slot per job kind", async () => {
    await ScheduleState.create({ _id: "categories", lastSlotAt: SEEN });
    await expect(
      ScheduleState.create({ _id: "categories", lastSlotAt: SEEN }),
    ).rejects.toMatchObject({ code: 11000 });
  });
});
