import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import type { ParsedProduct } from "../../scraping/types";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../test/mongo";
import { KeywordResult } from "../models/keyword-result";
import { PricePoint } from "../models/price-point";
import { Product } from "../models/product";
import { saveStoreResults } from "../save-store-results";

const FIRST_RUN = new Date("2026-11-20T10:00:00Z");
const SECOND_RUN = new Date("2026-11-21T10:00:00Z");

function parsed(externalId: string, overrides: Partial<ParsedProduct> = {}): ParsedProduct {
  return {
    externalId,
    title: `Apple iPhone ${externalId}`,
    url: `https://www.mall.hr/p/${externalId}`,
    imageUrl: `https://www.mall.hr/i/${externalId}/550/550`,
    priceCents: 129999,
    regularPriceCents: null,
    available: true,
    ...overrides,
  };
}

beforeAll(async () => {
  await connectMemoryMongoDB();
  await Promise.all([Product, PricePoint, KeywordResult].map((model) => model.syncIndexes()));
});
afterEach(clearDatabase);
afterAll(disconnectMemoryMongoDB);

describe("saveStoreResults", () => {
  test("saves a new product with one price point and its rank for the keyword", async () => {
    const result = await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("a"), parsed("b", { priceCents: 99900, regularPriceCents: 119900 })],
      seenAt: FIRST_RUN,
    });

    expect(result).toEqual({ saved: 2, priceChanges: 0 });
    const b = await Product.findOne({ storeSlug: "mall", externalId: "b" }).lean();
    expect(b).toMatchObject({
      title: "Apple iPhone b",
      priceCents: 99900,
      regularPriceCents: 119900,
      discountPercent: 16,
      currency: "EUR",
      available: true,
      firstSeenAt: FIRST_RUN,
      lastSeenAt: FIRST_RUN,
    });
    expect(b?.previousPriceCents).toBeUndefined();
    expect(b?.priceChangedAt).toBeUndefined();

    const points = await PricePoint.find({ productId: b?._id }).lean();
    expect(points).toMatchObject([
      { priceCents: 99900, regularPriceCents: 119900, observedAt: FIRST_RUN },
    ]);

    const ranks = await KeywordResult.find({ keyword: "iphone" }).sort({ rank: 1 }).lean();
    const a = await Product.findOne({ externalId: "a" }).lean();
    expect(
      ranks.map(({ productId, rank, storeSlug, seenAt }) => ({
        productId: String(productId),
        rank,
        storeSlug,
        seenAt,
      })),
    ).toEqual([
      { productId: String(a?._id), rank: 1, storeSlug: "mall", seenAt: FIRST_RUN },
      { productId: String(b?._id), rank: 2, storeSlug: "mall", seenAt: FIRST_RUN },
    ]);
  });

  test("moves lastSeenAt without a new price point when the price is the same", async () => {
    await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("a")],
      seenAt: FIRST_RUN,
    });
    const result = await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("a", { title: "Apple iPhone a (renamed)" })],
      seenAt: SECOND_RUN,
    });

    expect(result).toEqual({ saved: 1, priceChanges: 0 });
    const a = await Product.findOne({ externalId: "a" }).lean();
    expect(a).toMatchObject({
      title: "Apple iPhone a (renamed)",
      firstSeenAt: FIRST_RUN,
      lastSeenAt: SECOND_RUN,
    });
    expect(await PricePoint.countDocuments({ productId: a?._id })).toBe(1);
  });

  test("records a price change as a second point and keeps the previous price", async () => {
    await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("a", { priceCents: 129999, regularPriceCents: 149999 })],
      seenAt: FIRST_RUN,
    });
    const result = await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("a", { priceCents: 119999, regularPriceCents: 149999 })],
      seenAt: SECOND_RUN,
    });

    expect(result).toEqual({ saved: 1, priceChanges: 1 });
    const a = await Product.findOne({ externalId: "a" }).lean();
    expect(a).toMatchObject({
      priceCents: 119999,
      previousPriceCents: 129999,
      priceChangedAt: SECOND_RUN,
      discountPercent: 20,
    });
    const points = await PricePoint.find({ productId: a?._id }).sort({ observedAt: 1 }).lean();
    expect(points.map((point) => [point.priceCents, point.observedAt])).toEqual([
      [129999, FIRST_RUN],
      [119999, SECOND_RUN],
    ]);
  });

  test("adds a price point but no price change when only the regular price changes", async () => {
    await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("a", { regularPriceCents: 149999 })],
      seenAt: FIRST_RUN,
    });
    const result = await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("a", { regularPriceCents: null })],
      seenAt: SECOND_RUN,
    });

    expect(result.priceChanges).toBe(0);
    const a = await Product.findOne({ externalId: "a" }).lean();
    expect(a).toMatchObject({ regularPriceCents: null, discountPercent: 0 });
    expect(a?.priceChangedAt).toBeUndefined();
    expect(await PricePoint.countDocuments({ productId: a?._id })).toBe(2);
  });

  test("saves a product listed twice once, with the rank of its first appearance", async () => {
    const result = await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("a"), parsed("b"), parsed("a", { priceCents: 1 }), parsed("c")],
      seenAt: FIRST_RUN,
    });

    expect(result.saved).toBe(3);
    const products = await Product.find().lean();
    expect(products).toHaveLength(3);
    expect(products.find((product) => product.externalId === "a")?.priceCents).toBe(129999);
    const externalIds = new Map(
      products.map((product) => [String(product._id), product.externalId]),
    );
    const ranks = await KeywordResult.find().sort({ rank: 1 }).lean();
    expect(ranks.map((row) => [externalIds.get(String(row.productId)), row.rank])).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
  });

  test("drops the keyword link of a product missing from the next run of that store only", async () => {
    await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("a"), parsed("b")],
      seenAt: FIRST_RUN,
    });
    await saveStoreResults({
      storeSlug: "bigbang",
      keyword: "iphone",
      products: [parsed("x")],
      seenAt: FIRST_RUN,
    });
    await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("b")],
      seenAt: SECOND_RUN,
    });

    const a = await Product.findOne({ storeSlug: "mall", externalId: "a" }).lean();
    expect(a).not.toBeNull();
    expect(await KeywordResult.countDocuments({ productId: a?._id })).toBe(0);
    const rows = await KeywordResult.find({ keyword: "iphone" }).lean();
    expect(rows.map((row) => [row.storeSlug, row.rank, row.seenAt]).sort()).toEqual(
      [
        ["bigbang", 1, FIRST_RUN],
        ["mall", 1, SECOND_RUN],
      ].sort(),
    );
  });

  test("keeps the same external ID in two stores apart", async () => {
    await saveStoreResults({
      storeSlug: "mall",
      keyword: "iphone",
      products: [parsed("1")],
      seenAt: FIRST_RUN,
    });
    await saveStoreResults({
      storeSlug: "bigbang",
      keyword: "iphone",
      products: [parsed("1", { priceCents: 5000 })],
      seenAt: FIRST_RUN,
    });

    expect(await Product.countDocuments({ externalId: "1" })).toBe(2);
    expect((await Product.findOne({ storeSlug: "mall" }).lean())?.priceCents).toBe(129999);
  });
});

describe("Product model", () => {
  test("rejects a second product with the same store and external ID", async () => {
    const fields = {
      storeSlug: "mall",
      externalId: "a",
      title: "Apple iPhone",
      url: "https://www.mall.hr/p/a",
      imageUrl: null,
      priceCents: 100,
      regularPriceCents: null,
      discountPercent: 0,
      available: true,
      firstSeenAt: FIRST_RUN,
      lastSeenAt: FIRST_RUN,
    };
    await Product.create(fields);
    await expect(Product.create(fields)).rejects.toMatchObject({ code: 11000 });
  });

  test("has no description field (#50, minimal data)", () => {
    expect(Product.schema.path("description")).toBeUndefined();
  });
});
