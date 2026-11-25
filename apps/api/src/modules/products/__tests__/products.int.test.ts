import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import type { ProductDto, ProductsPageDto } from "@storeseeker/shared";
import { createApp } from "../../../app";
import { createLogger } from "../../../http/logger";
import { insertProduct, insertStore } from "../../../test/factories";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../../test/mongo";

const app = createApp({ clientUrl: "http://localhost:5173", logger: createLogger("silent") });

// Galaxa 5 of demo-a is inserted before the one of demo-b, so it has the smaller _id
async function insertCatalog() {
  await insertStore("demo-a");
  await insertStore("demo-b");
  await insertStore("demo-c", false);
  await insertProduct({ title: "Slušalice X1", categories: ["slusalice"], priceCents: 5_000 });
  await insertProduct({
    title: "Nordtek Galaxa 5",
    priceCents: 30_000,
    regularPriceCents: 40_000,
  });
  await insertProduct({ title: "Nordtek Galaxa 5", storeSlug: "demo-b", priceCents: 29_000 });
  await insertProduct({ title: "Nordtek Orbit 7", storeSlug: "demo-b", priceCents: 20_000 });
  await insertProduct({ title: "axb", categories: ["laptopi"], priceCents: 10_000 });
  await insertProduct({
    title: "Nordtek Book 5",
    storeSlug: "demo-b",
    categories: ["laptopi"],
    priceCents: 80_000,
    regularPriceCents: 100_000,
  });
  await insertProduct({ title: "Nordtek Galaxa 4", priceCents: 25_000, available: false });
  await insertProduct({ title: "Nordtek Galaxa 5", storeSlug: "demo-c", priceCents: 28_000 });
}

async function search(query: string): Promise<ProductsPageDto> {
  const res = await request(app).get(`/api/products?${query}`);
  expect(res.status).toBe(200);
  return res.body as ProductsPageDto;
}

const titles = (page: ProductsPageDto) => page.items.map((item) => item.title);
const names = (page: ProductsPageDto) =>
  page.items.map((item) => `${item.title} (${item.storeSlug})`);

describe("GET /api/products", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);
  beforeEach(async () => {
    await clearDatabase();
    await insertCatalog();
  });

  test("returns available products of enabled stores as ProductDto", async () => {
    const page = await search("q=slusalice");
    expect(page).toMatchObject({ total: 1, page: 1, pageSize: 24 });
    expect(page.items[0]).toEqual({
      id: expect.stringMatching(/^[a-f0-9]{24}$/),
      storeSlug: "demo-a",
      storeName: "Demo trgovina A",
      title: "Slušalice X1",
      url: "https://shop.example/Slu%C5%A1alice%20X1",
      imageUrl: null,
      priceCents: 5_000,
      regularPriceCents: null,
      discountPercent: 0,
      currency: "EUR",
      available: true,
      categories: ["slusalice"],
      lastSeenAt: "2026-11-25T06:00:00.000Z",
    } satisfies ProductDto);
  });

  test("finds a word by its beginning, without diacritics", async () => {
    expect(names(await search("q=galax"))).toEqual([
      "Nordtek Galaxa 5 (demo-a)",
      "Nordtek Galaxa 5 (demo-b)",
    ]);
  });

  test("a dot in the term is literal", async () => {
    expect((await search("q=a.b")).total).toBe(0);
  });

  test("needs every word of the term", async () => {
    expect(names(await search("q=nordtek%205"))).toEqual([
      "Nordtek Book 5 (demo-b)",
      "Nordtek Galaxa 5 (demo-a)",
      "Nordtek Galaxa 5 (demo-b)",
    ]);
  });

  test("filters by category and by store", async () => {
    expect(titles(await search("category=laptopi"))).toEqual(["Nordtek Book 5", "axb"]);
    expect(titles(await search("store=demo-b"))).toEqual([
      "Nordtek Book 5",
      "Nordtek Galaxa 5",
      "Nordtek Orbit 7",
    ]);
    expect(titles(await search("store=demo-a&category=laptopi,slusalice"))).toEqual([
      "Slušalice X1",
      "axb",
    ]);
  });

  test("filters by price in whole euros, both ends included", async () => {
    expect(names(await search("min=200&max=300&sort=price_asc"))).toEqual([
      "Nordtek Orbit 7 (demo-b)",
      "Nordtek Galaxa 5 (demo-b)",
      "Nordtek Galaxa 5 (demo-a)",
    ]);
  });

  test("discounted=true keeps only products on sale", async () => {
    expect(titles(await search("discounted=true"))).toEqual(["Nordtek Book 5", "Nordtek Galaxa 5"]);
  });

  test("counts no unavailable product and no product of a disabled store", async () => {
    const page = await search("");
    expect(page.total).toBe(6);
    expect(page.facets.stores).toEqual([
      { value: "demo-a", count: 3 },
      { value: "demo-b", count: 3 },
    ]);
    expect(page.facets.categories).toEqual([
      { value: "mobiteli", count: 3 },
      { value: "laptopi", count: 2 },
      { value: "slusalice", count: 1 },
    ]);
  });

  test("the store facet ignores the store filter and keeps the category filter", async () => {
    expect((await search("store=demo-a")).facets.stores).toEqual([
      { value: "demo-a", count: 3 },
      { value: "demo-b", count: 3 },
    ]);
    expect((await search("store=demo-a&category=laptopi")).facets.stores).toEqual([
      { value: "demo-a", count: 1 },
      { value: "demo-b", count: 1 },
    ]);
  });

  test("the category facet ignores the category filter and keeps the store filter", async () => {
    expect((await search("category=laptopi")).facets.categories).toEqual([
      { value: "mobiteli", count: 3 },
      { value: "laptopi", count: 2 },
      { value: "slusalice", count: 1 },
    ]);
    expect((await search("category=laptopi&store=demo-b")).facets.categories).toEqual([
      { value: "mobiteli", count: 2 },
      { value: "laptopi", count: 1 },
    ]);
  });

  test("relevance without a term sorts by title", async () => {
    expect(names(await search(""))).toEqual([
      "Nordtek Book 5 (demo-b)",
      "Nordtek Galaxa 5 (demo-a)",
      "Nordtek Galaxa 5 (demo-b)",
      "Nordtek Orbit 7 (demo-b)",
      "Slušalice X1 (demo-a)",
      "axb (demo-a)",
    ]);
  });

  test("relevance with a term puts an earlier match first", async () => {
    await insertProduct({ title: "Futrola za Nordtek" });
    expect(titles(await search("q=nordtek"))).toEqual([
      "Nordtek Book 5",
      "Nordtek Galaxa 5",
      "Nordtek Galaxa 5",
      "Nordtek Orbit 7",
      "Futrola za Nordtek",
    ]);
  });

  test("sorts by price both ways and by discount", async () => {
    expect(titles(await search("sort=price_asc"))).toEqual([
      "Slušalice X1",
      "axb",
      "Nordtek Orbit 7",
      "Nordtek Galaxa 5",
      "Nordtek Galaxa 5",
      "Nordtek Book 5",
    ]);
    expect(names(await search("sort=price_desc"))).toEqual([
      "Nordtek Book 5 (demo-b)",
      "Nordtek Galaxa 5 (demo-a)",
      "Nordtek Galaxa 5 (demo-b)",
      "Nordtek Orbit 7 (demo-b)",
      "axb (demo-a)",
      "Slušalice X1 (demo-a)",
    ]);
    expect(names(await search("sort=discount"))).toEqual([
      "Nordtek Galaxa 5 (demo-a)",
      "Nordtek Book 5 (demo-b)",
      "Slušalice X1 (demo-a)",
      "axb (demo-a)",
      "Nordtek Orbit 7 (demo-b)",
      "Nordtek Galaxa 5 (demo-b)",
    ]);
  });

  test("equal prices keep the order of _id, not of title", async () => {
    await insertProduct({ title: "Zeta", categories: ["tableti"], priceCents: 1_000 });
    await insertProduct({ title: "Alfa", categories: ["tableti"], priceCents: 1_000 });
    expect(titles(await search("category=tableti&sort=price_asc"))).toEqual(["Zeta", "Alfa"]);
    expect(titles(await search("category=tableti&sort=price_desc"))).toEqual(["Zeta", "Alfa"]);
  });

  test("pages follow each other, and a page past the end is empty", async () => {
    const second = await search("sort=price_asc&pageSize=2&page=2");
    expect(titles(second)).toEqual(["Nordtek Orbit 7", "Nordtek Galaxa 5"]);
    expect(second).toMatchObject({ total: 6, page: 2, pageSize: 2 });
    const past = await search("pageSize=2&page=99");
    expect(past).toMatchObject({ items: [], total: 6, page: 99 });
  });

  test.each(["min=200&max=100", "discounted=yes", "store=mall", "category=auti", "q=a"])(
    "%s gives 400 with a Croatian message",
    async (query) => {
      const res = await request(app).get(`/api/products?${query}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("validation_error");
      expect(res.body.error.message).toMatch(/[A-ZČĆŠŽĐ]/);
    },
  );
});
