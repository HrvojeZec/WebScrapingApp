import { describe, expect, test } from "vitest";
import { createScrapeBodySchema, LIMITS, objectIdSchema, productsQuerySchema } from "../index.js";

describe("productsQuerySchema", () => {
  test("fills in defaults for an empty query", () => {
    expect(productsQuerySchema.parse({})).toEqual({ sort: "relevance", page: 1, pageSize: 24 });
  });

  test("splits the store list and drops duplicates", () => {
    expect(productsQuerySchema.parse({ store: "harveynorman,demo-a,harveynorman" }).store).toEqual([
      "harveynorman",
      "demo-a",
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

describe("createScrapeBodySchema", () => {
  test("accepts no body and an empty object", () => {
    expect(createScrapeBodySchema.parse(undefined)).toBeUndefined();
    expect(createScrapeBodySchema.parse({})).toEqual({});
  });

  test("accepts one to every category", () => {
    expect(createScrapeBodySchema.parse({ categories: ["laptopi"] })).toEqual({
      categories: ["laptopi"],
    });
    const all = ["mobiteli", "laptopi", "televizori", "tableti", "slusalice"];
    expect(createScrapeBodySchema.parse({ categories: all })).toEqual({ categories: all });
  });

  test.each([
    ["an empty list", []],
    ["an unknown category", ["auti"]],
    ["a string", "mobiteli"],
    ["a repeated category", ["mobiteli", "mobiteli"]],
  ])("rejects %s", (_name, categories) => {
    expect(createScrapeBodySchema.safeParse({ categories }).success).toBe(false);
  });

  test("tells the user that a category is repeated", () => {
    const result = createScrapeBodySchema.safeParse({ categories: ["laptopi", "laptopi"] });
    expect(result.error?.issues[0]?.message).toBe("Svaku kategoriju navedi samo jednom.");
  });
});

describe("LIMITS", () => {
  test("match the limits of the completion design", () => {
    expect(LIMITS).toMatchObject({
      requestIntervalMs: 5000,
      pagesPerCategory: 30,
      categoryCrawlTimeoutMs: 5 * 60 * 1000,
      refreshCooldownMs: 30 * 60 * 1000,
      refreshesPerIpPerHour: 3,
      historyDaysDefault: 90,
      historyDaysMax: 365,
      lowestPriceWindowDays: 30,
      suggestionsMax: 8,
      similarProductsMax: 4,
      dealsMax: 24,
      wishlistMax: 20,
      priceChecksPerDay: 2,
      loginAttempts: { max: 10, windowMs: 15 * 60 * 1000 },
      searchTermMinLength: 2,
      searchTermMaxLength: 60,
      limitTimeZone: "Europe/Zagreb",
    });
  });

  test("no longer hold the limits of scraping per search term", () => {
    for (const key of [
      "keywordCacheTtlMs",
      "dailyScrapesPerIp",
      "dailyScrapesPerUser",
      "dailyScrapesGlobal",
      "concurrentJobsPerRequester",
      "pagesPerStore",
      "jobTimeoutMs",
      "jobQueueTimeoutMs",
      "keywordMinLength",
      "keywordMaxLength",
    ]) {
      expect(LIMITS).not.toHaveProperty(key);
    }
  });
});
