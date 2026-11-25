import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { CrawlRun } from "../../db/models/crawl-run";
import { Meta } from "../../db/models/meta";
import { PricePoint } from "../../db/models/price-point";
import { Product } from "../../db/models/product";
import { Store } from "../../db/models/store";
import { connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../test/mongo";
import { buildDemoDataset } from "../demo-dataset";
import { seedDemo } from "../seed-demo";

const TODAY = new Date(2026, 10, 25, 14, 30);

async function counts() {
  return {
    stores: await Store.countDocuments(),
    products: await Product.countDocuments(),
    pricePoints: await PricePoint.countDocuments(),
    crawlRuns: await CrawlRun.countDocuments(),
  };
}

describe("seedDemo", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);

  const dataset = buildDemoDataset(TODAY);
  const expected = {
    stores: dataset.stores.length,
    products: dataset.products.length,
    pricePoints: dataset.pricePoints.length,
    crawlRuns: dataset.crawlRuns.length,
  };

  test("writes the whole dataset and marks the database as demo", async () => {
    await Store.create({ slug: "harveynorman", name: "Harvey Norman", baseUrl: "https://x.hr" });

    const result = await seedDemo(TODAY);

    expect(result).toEqual({ products: expected.products, pricePoints: expected.pricePoints });
    expect(await counts()).toEqual(expected);
    const meta = await Meta.findById("dataset").lean();
    expect(meta).toMatchObject({ demo: true, seededAt: TODAY });
  });

  test("a second run replaces the data instead of adding to it", async () => {
    await seedDemo(TODAY);
    expect(await counts()).toEqual(expected);
    expect(await Meta.countDocuments()).toBe(1);
  });
});
