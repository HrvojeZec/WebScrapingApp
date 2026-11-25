import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import type { DealsDto } from "@storeseeker/shared";
import { createApp } from "../../../app";
import { createLogger } from "../../../http/logger";
import {
  insertPoints,
  insertProduct,
  insertStore,
  type PointInput,
  type ProductInput,
} from "../../../test/factories";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../../test/mongo";

const NOW = new Date("2026-11-25T12:00:00Z");
const app = createApp({
  clientUrl: "http://localhost:5173",
  logger: createLogger("silent"),
  now: () => NOW,
});

async function insertWithHistory(input: ProductInput, points: PointInput[]) {
  const product = await insertProduct(input);
  await insertPoints(product._id, NOW, points);
}

async function deals(query = ""): Promise<string[]> {
  const res = await request(app).get(`/api/deals${query}`);
  expect(res.status).toBe(200);
  return (res.body as DealsDto).items.map(
    (deal) => `${deal.product.title} ${deal.product.discountPercent}% ${deal.inflatedDiscount}`,
  );
}

describe("GET /api/deals", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);
  beforeEach(async () => {
    await clearDatabase();
    await insertStore("demo-a");
    await insertStore("demo-c", false);
    await insertWithHistory({ title: "Inflated", priceCents: 6_000, regularPriceCents: 10_000 }, [
      { daysAgo: 40, priceCents: 6_000 },
      { daysAgo: 10, priceCents: 10_000 },
      { daysAgo: 0, priceCents: 6_000, regularPriceCents: 10_000 },
    ]);
    await insertWithHistory({ title: "New", priceCents: 7_000, regularPriceCents: 10_000 }, [
      { daysAgo: 0, priceCents: 7_000, regularPriceCents: 10_000 },
    ]);
    await insertWithHistory({ title: "Real25", priceCents: 7_500, regularPriceCents: 10_000 }, [
      { daysAgo: 60, priceCents: 10_000 },
      { daysAgo: 0, priceCents: 7_500, regularPriceCents: 10_000 },
    ]);
    await insertWithHistory({ title: "Real20", priceCents: 8_000, regularPriceCents: 10_000 }, [
      { daysAgo: 60, priceCents: 10_000 },
      { daysAgo: 0, priceCents: 8_000, regularPriceCents: 10_000 },
    ]);
    await insertWithHistory({ title: "Steady" }, [{ daysAgo: 60, priceCents: 10_000 }]);
    await insertWithHistory(
      { title: "Gone", priceCents: 5_000, regularPriceCents: 10_000, available: false },
      [{ daysAgo: 0, priceCents: 5_000, regularPriceCents: 10_000 }],
    );
    await insertWithHistory(
      { title: "Hidden", storeSlug: "demo-c", priceCents: 5_000, regularPriceCents: 10_000 },
      [{ daysAgo: 0, priceCents: 5_000, regularPriceCents: 10_000 }],
    );
  });

  test("real sales come first, then sales without a verdict, then inflated ones", async () => {
    expect(await deals()).toEqual([
      "Real25 25% false",
      "Real20 20% false",
      "New 30% null",
      "Inflated 40% true",
    ]);
  });

  test("a real sale of 20 % comes before an inflated one of 40 %", async () => {
    const order = await deals();
    expect(order.indexOf("Real20 20% false")).toBeLessThan(order.indexOf("Inflated 40% true"));
  });

  test("returns the first limit deals of the limit × 4 biggest discounts", async () => {
    expect(await deals("?limit=1")).toEqual(["Real25 25% false"]);
    expect(await deals("?limit=2")).toEqual(["Real25 25% false", "Real20 20% false"]);
  });

  test("returns products of enabled stores as ProductDto", async () => {
    const res = await request(app).get("/api/deals?limit=1");
    expect(res.body.items[0].product).toMatchObject({
      storeSlug: "demo-a",
      storeName: "Demo trgovina A",
      priceCents: 7_500,
      regularPriceCents: 10_000,
    });
  });

  test("limit=25 gives 400", async () => {
    const res = await request(app).get("/api/deals?limit=25");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("validation_error");
  });
});
