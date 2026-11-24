import { describe, expect, test } from "vitest";
import { LIMITS, objectIdSchema, productsQuerySchema } from "../index.js";

describe("productsQuerySchema", () => {
  test("fills in defaults for an empty query", () => {
    expect(productsQuerySchema.parse({})).toEqual({ sort: "relevance", page: 1, pageSize: 24 });
  });

  test("splits the store list and drops duplicates", () => {
    expect(productsQuerySchema.parse({ store: "mall,bigbang,mall" }).store).toEqual([
      "mall",
      "bigbang",
    ]);
  });

  test("coerces numeric query strings", () => {
    expect(productsQuerySchema.parse({ page: "3", pageSize: "48" })).toMatchObject({
      page: 3,
      pageSize: 48,
    });
  });

  test.each([{ store: "ekupi" }, { pageSize: "49" }, { page: "0" }])("rejects %j", (query) => {
    expect(productsQuerySchema.safeParse(query).success).toBe(false);
  });
});

describe("objectIdSchema", () => {
  test("accepts 24 hex characters", () => {
    expect(objectIdSchema.safeParse("64b7f0c2a1e4d3b2c1a0f9e8").success).toBe(true);
  });

  test("rejects anything else with a message for the user", () => {
    const result = objectIdSchema.safeParse("abc");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Neispravan ID.");
  });
});

describe("LIMITS", () => {
  test("match the limits table of the design doc (5.2)", () => {
    expect(LIMITS).toMatchObject({
      keywordCacheTtlMs: 6 * 60 * 60 * 1000,
      dailyScrapesPerIp: 5,
      dailyScrapesPerUser: 20,
      dailyScrapesGlobal: 300,
      concurrentJobsPerRequester: 1,
      pagesPerStore: 2,
      requestIntervalMs: 2000,
      wishlistMax: 20,
      priceChecksPerDay: 2,
      loginAttempts: { max: 10, windowMs: 15 * 60 * 1000 },
      keywordMinLength: 2,
      keywordMaxLength: 60,
      limitTimeZone: "Europe/Zagreb",
    });
  });
});
