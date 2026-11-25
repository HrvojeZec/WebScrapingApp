import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import type { PriceHistoryDto, ProductDetailDto, ProductDto } from "@storeseeker/shared";
import { createApp } from "../../../app";
import { createLogger } from "../../../http/logger";
import { DAY_MS, insertPoints, insertProduct, insertStore } from "../../../test/factories";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../../test/mongo";

const NOW = new Date("2026-11-25T12:00:00Z");
const EAN = "3850000000017";
const app = createApp({
  clientUrl: "http://localhost:5173",
  logger: createLogger("silent"),
  now: () => NOW,
});

const daysAgo = (days: number) => new Date(NOW.getTime() - days * DAY_MS).toISOString();
const names = (products: ProductDto[]) =>
  products.map((product) => `${product.title} (${product.storeSlug})`);

async function detail(id: string): Promise<ProductDetailDto> {
  const res = await request(app).get(`/api/products/${id}`);
  expect(res.status).toBe(200);
  return res.body as ProductDetailDto;
}

beforeAll(connectMemoryMongoDB);
afterAll(disconnectMemoryMongoDB);

describe("GET /api/products/:id", () => {
  beforeEach(async () => {
    await clearDatabase();
    await insertStore("demo-a");
    await insertStore("demo-b");
    await insertStore("demo-c", false);
  });

  async function insertPhone() {
    const phone = await insertProduct({
      title: "Nordtek Galaxa 5 128GB",
      priceCents: 8_000,
      regularPriceCents: 10_000,
      ean: EAN,
    });
    // The inflated sale of Task 2: 80 € for 40 days, 100 € for 10 days, then "100 € → 80 €"
    await insertPoints(phone._id, NOW, [
      { daysAgo: 40, priceCents: 8_000 },
      { daysAgo: 10, priceCents: 10_000 },
      { daysAgo: 0, priceCents: 8_000, regularPriceCents: 10_000 },
    ]);
    return phone;
  }

  test("returns the product and the insight of its history", async () => {
    const phone = await insertPhone();
    const body = await detail(phone.id as string);
    expect(body.product).toMatchObject({
      id: phone.id,
      title: "Nordtek Galaxa 5 128GB",
      storeName: "Demo trgovina A",
      discountPercent: 20,
    });
    expect(body.insight).toEqual({
      lowest30dCents: 8_000,
      historySince: daysAgo(40),
      inflatedDiscount: true,
    });
  });

  test("sameProducts match by EAN or by the same searchText, only in other stores", async () => {
    const phone = await insertPhone();
    await insertProduct({
      title: "NORDTEK Galaxa5 128 GB",
      storeSlug: "demo-b",
      priceCents: 8_500,
      ean: EAN,
    });
    await insertProduct({
      title: "Nordtek Galaxa 5 128GB",
      storeSlug: "demo-b",
      priceCents: 7_900,
    });
    await insertProduct({ title: "Nordtek Galaxa 5 128GB", priceCents: 7_000 });
    await insertProduct({ title: "Nordtek Galaxa 5 128GB", storeSlug: "demo-c", ean: EAN });
    await insertProduct({
      title: "Nordtek Galaxa 5 128GB",
      storeSlug: "demo-b",
      available: false,
    });
    const body = await detail(phone.id as string);
    expect(names(body.sameProducts)).toEqual([
      "Nordtek Galaxa 5 128GB (demo-b)",
      "NORDTEK Galaxa5 128 GB (demo-b)",
    ]);
  });

  test("similarProducts share a category and the first two words, by price", async () => {
    const phone = await insertPhone();
    await insertProduct({ title: "Nordtek Galaxa 5 128GB", storeSlug: "demo-b" });
    await insertProduct({
      title: "Nordtek Galaxa 5 256GB",
      storeSlug: "demo-b",
      priceCents: 12_000,
    });
    await insertProduct({ title: "Nordtek Galaxa 5 Lite", storeSlug: "demo-b", priceCents: 6_000 });
    await insertProduct({ title: "Nordtek Galaxa 5 Mini", priceCents: 5_000 });
    await insertProduct({
      title: "Nordtek Galaxa Book",
      storeSlug: "demo-b",
      categories: ["laptopi"],
    });
    await insertProduct({ title: "Orbit Galaxa 5", storeSlug: "demo-b" });
    const body = await detail(phone.id as string);
    expect(names(body.sameProducts)).toEqual(["Nordtek Galaxa 5 128GB (demo-b)"]);
    expect(names(body.similarProducts)).toEqual([
      "Nordtek Galaxa 5 Lite (demo-b)",
      "Nordtek Galaxa 5 256GB (demo-b)",
    ]);
  });

  test("similarProducts stop at LIMITS.similarProductsMax", async () => {
    const phone = await insertPhone();
    for (const memory of [16, 32, 64, 256, 512]) {
      await insertProduct({
        title: `Nordtek Galaxa 5 ${memory}GB`,
        storeSlug: "demo-b",
        priceCents: memory * 100,
      });
    }
    const body = await detail(phone.id as string);
    expect(body.similarProducts.map((product) => product.title)).toEqual([
      "Nordtek Galaxa 5 16GB",
      "Nordtek Galaxa 5 32GB",
      "Nordtek Galaxa 5 64GB",
      "Nordtek Galaxa 5 256GB",
    ]);
  });

  test("an unavailable product still has its page", async () => {
    const old = await insertProduct({ title: "Nordtek Galaxa 3", available: false });
    await insertPoints(old._id, NOW, [{ daysAgo: 60, priceCents: 9_000 }]);
    const body = await detail(old.id as string);
    expect(body.product.available).toBe(false);
    expect(body.insight).toMatchObject({ lowest30dCents: 9_000, inflatedDiscount: null });
  });

  test("a product of a disabled store and an unknown id give 404", async () => {
    const hidden = await insertProduct({ title: "Nordtek Galaxa 5", storeSlug: "demo-c" });
    for (const id of [hidden.id as string, "64b7f0c2a1e4d3b2c1a0f9e8"]) {
      const res = await request(app).get(`/api/products/${id}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("not_found");
    }
  });

  test("a malformed id gives 400", async () => {
    const res = await request(app).get("/api/products/abc");
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({ code: "validation_error", message: "Neispravan ID." });
  });
});

describe("GET /api/products/:id/history", () => {
  beforeEach(async () => {
    await clearDatabase();
    await insertStore("demo-a");
    await insertStore("demo-c", false);
  });

  test("starts at the last point before the window and goes up in time", async () => {
    const tv = await insertProduct({ title: "Vidora TV 55" });
    await insertPoints(tv._id, NOW, [
      { daysAgo: 5, priceCents: 9_000 },
      { daysAgo: 50, priceCents: 12_000 },
      { daysAgo: 40, priceCents: 11_000 },
      { daysAgo: 20, priceCents: 10_000, regularPriceCents: 11_000 },
    ]);
    const res = await request(app).get(`/api/products/${tv.id as string}/history?days=30`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      points: [
        { priceCents: 11_000, regularPriceCents: null, observedAt: daysAgo(40) },
        { priceCents: 10_000, regularPriceCents: 11_000, observedAt: daysAgo(20) },
        { priceCents: 9_000, regularPriceCents: null, observedAt: daysAgo(5) },
      ],
    } satisfies PriceHistoryDto);
  });

  test("days=0 gives 400", async () => {
    const tv = await insertProduct({ title: "Vidora TV 55" });
    const res = await request(app).get(`/api/products/${tv.id as string}/history?days=0`);
    expect(res.status).toBe(400);
  });

  test("a product of a disabled store gives 404", async () => {
    const hidden = await insertProduct({ title: "Vidora TV 55", storeSlug: "demo-c" });
    await insertPoints(hidden._id, NOW, [{ daysAgo: 5, priceCents: 9_000 }]);
    const res = await request(app).get(`/api/products/${hidden.id as string}/history`);
    expect(res.status).toBe(404);
  });
});
