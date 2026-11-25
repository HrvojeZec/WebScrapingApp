import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import type { CategorySlug, StoreSlug } from "@storeseeker/shared";
import type { ParsedProduct } from "../../scraping/types";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../test/mongo";
import { PricePoint } from "../models/price-point";
import { Product } from "../models/product";
import { saveCategoryCrawl } from "../save-category-crawl";

const FIRST_RUN = new Date("2026-11-20T10:00:00Z");
const SECOND_RUN = new Date("2026-11-21T10:00:00Z");
const THIRD_RUN = new Date("2026-11-22T10:00:00Z");

function parsed(externalId: string, overrides: Partial<ParsedProduct> = {}): ParsedProduct {
  return {
    externalId,
    title: `Samsung Galaxy Slušalice ${externalId}`,
    url: `https://www.harveynorman.hr/p/${externalId}`,
    imageUrl: `https://www.harveynorman.hr/i/${externalId}.jpg`,
    priceCents: 129999,
    regularPriceCents: null,
    available: true,
    ...overrides,
  };
}

function crawl(
  category: CategorySlug,
  products: ParsedProduct[],
  seenAt: Date,
  {
    complete = true,
    storeSlug = "harveynorman",
  }: { complete?: boolean; storeSlug?: StoreSlug } = {},
) {
  return saveCategoryCrawl({ storeSlug, category, products, seenAt, complete });
}

function find(externalId: string, storeSlug: StoreSlug = "harveynorman") {
  return Product.findOne({ storeSlug, externalId }).lean();
}

beforeAll(async () => {
  await connectMemoryMongoDB();
  await Promise.all([Product, PricePoint].map((model) => model.syncIndexes()));
});
afterEach(clearDatabase);
afterAll(disconnectMemoryMongoDB);

describe("saveCategoryCrawl", () => {
  test("saves a new product with its category, search text and one price point", async () => {
    const result = await crawl("mobiteli", [parsed("a", { regularPriceCents: 149999 })], FIRST_RUN);

    expect(result).toEqual({ saved: 1, priceChanges: 0, delisted: 0 });
    const a = await find("a");
    expect(a).toMatchObject({
      categories: ["mobiteli"],
      searchText: "samsung galaxy slusalice a",
      priceCents: 129999,
      regularPriceCents: 149999,
      discountPercent: 13,
      currency: "EUR",
      available: true,
      firstSeenAt: FIRST_RUN,
      lastSeenAt: FIRST_RUN,
    });
    expect(a?.previousPriceCents).toBeUndefined();
    const points = await PricePoint.find({ productId: a?._id }).lean();
    expect(points).toMatchObject([
      { priceCents: 129999, regularPriceCents: 149999, observedAt: FIRST_RUN },
    ]);
  });

  test("a product seen in a second category has both categories", async () => {
    await crawl("mobiteli", [parsed("a")], FIRST_RUN);
    await crawl("tableti", [parsed("a")], SECOND_RUN);

    const a = await find("a");
    expect([...(a?.categories ?? [])].sort()).toEqual(["mobiteli", "tableti"]);
    expect(await PricePoint.countDocuments({ productId: a?._id })).toBe(1);
  });

  test("a price change adds a second point and keeps the previous price", async () => {
    await crawl("mobiteli", [parsed("a")], FIRST_RUN);
    const result = await crawl("mobiteli", [parsed("a", { priceCents: 119999 })], SECOND_RUN);

    expect(result).toEqual({ saved: 1, priceChanges: 1, delisted: 0 });
    const a = await find("a");
    expect(a).toMatchObject({
      priceCents: 119999,
      previousPriceCents: 129999,
      priceChangedAt: SECOND_RUN,
    });
    const points = await PricePoint.find({ productId: a?._id }).sort({ observedAt: 1 }).lean();
    expect(points.map((point) => [point.priceCents, point.observedAt])).toEqual([
      [129999, FIRST_RUN],
      [119999, SECOND_RUN],
    ]);
  });

  test("a change of only the regular price adds a point but is not a price change", async () => {
    await crawl("mobiteli", [parsed("a", { regularPriceCents: 149999 })], FIRST_RUN);
    const result = await crawl("mobiteli", [parsed("a")], SECOND_RUN);

    expect(result.priceChanges).toBe(0);
    const a = await find("a");
    expect(a?.priceChangedAt).toBeUndefined();
    expect(await PricePoint.countDocuments({ productId: a?._id })).toBe(2);
  });

  test("saves a product listed twice once, as it first appeared", async () => {
    const result = await crawl(
      "mobiteli",
      [parsed("a"), parsed("b"), parsed("a", { priceCents: 1 })],
      FIRST_RUN,
    );

    expect(result.saved).toBe(2);
    expect((await find("a"))?.priceCents).toBe(129999);
  });

  test("a complete crawl drops the category of an unseen product listed elsewhere too", async () => {
    await crawl("mobiteli", [parsed("p"), parsed("other")], FIRST_RUN);
    await crawl("tableti", [parsed("p")], FIRST_RUN);
    const result = await crawl("mobiteli", [parsed("other")], SECOND_RUN);

    expect(result.delisted).toBe(0);
    const p = await find("p");
    expect(p?.categories).toEqual(["tableti"]);
    expect(p?.available).toBe(true);
  });

  test("a complete crawl makes an unseen product of only that category unavailable", async () => {
    await crawl("mobiteli", [parsed("q"), parsed("other")], FIRST_RUN);
    const result = await crawl("mobiteli", [parsed("other")], SECOND_RUN);

    expect(result.delisted).toBe(1);
    const q = await find("q");
    expect(q?.categories).toEqual([]);
    expect(q?.available).toBe(false);
    expect(q?.lastSeenAt).toEqual(FIRST_RUN);
  });

  test("an incomplete crawl changes neither categories nor availability", async () => {
    await crawl("mobiteli", [parsed("q"), parsed("other")], FIRST_RUN);
    const result = await crawl("mobiteli", [parsed("other")], SECOND_RUN, { complete: false });

    expect(result.delisted).toBe(0);
    expect(await find("q")).toMatchObject({ categories: ["mobiteli"], available: true });
  });

  test("a crawl of another store leaves the first store's products alone", async () => {
    await crawl("mobiteli", [parsed("a")], FIRST_RUN);
    await crawl("mobiteli", [parsed("a", { priceCents: 5000 })], SECOND_RUN, {
      storeSlug: "demo-a",
    });
    await crawl("mobiteli", [parsed("b")], THIRD_RUN, { storeSlug: "demo-a" });

    expect(await find("a")).toMatchObject({
      priceCents: 129999,
      categories: ["mobiteli"],
      available: true,
    });
    expect((await find("a", "demo-a"))?.available).toBe(false);
  });

  // An empty listing means changed markup or a broken page, not a sold-out category
  test("a complete crawl with no products delists nothing", async () => {
    await crawl("mobiteli", [parsed("q")], FIRST_RUN);
    const result = await crawl("mobiteli", [], SECOND_RUN);

    expect(result).toEqual({ saved: 0, priceChanges: 0, delisted: 0 });
    expect(await find("q")).toMatchObject({ categories: ["mobiteli"], available: true });
  });

  test("a missing image URL keeps the saved one", async () => {
    await crawl("mobiteli", [parsed("a")], FIRST_RUN);
    await crawl("mobiteli", [parsed("a", { imageUrl: null })], SECOND_RUN);

    expect((await find("a"))?.imageUrl).toBe("https://www.harveynorman.hr/i/a.jpg");
  });

  test("sets the EAN only when the listing has one", async () => {
    await crawl("mobiteli", [parsed("a", { ean: "8806095467894" }), parsed("b")], FIRST_RUN);
    await crawl("mobiteli", [parsed("a"), parsed("b")], SECOND_RUN);

    expect((await find("a"))?.ean).toBe("8806095467894");
    expect((await find("b"))?.ean).toBeUndefined();
  });

  test("an unavailable product that comes back takes availability from the parser", async () => {
    await crawl("mobiteli", [parsed("q"), parsed("other")], FIRST_RUN);
    await crawl("mobiteli", [parsed("other")], SECOND_RUN);
    await crawl("mobiteli", [parsed("q"), parsed("other")], THIRD_RUN);

    expect(await find("q")).toMatchObject({ available: true, categories: ["mobiteli"] });
    await crawl("mobiteli", [parsed("q", { available: false }), parsed("other")], THIRD_RUN);
    expect((await find("q"))?.available).toBe(false);
  });
});
