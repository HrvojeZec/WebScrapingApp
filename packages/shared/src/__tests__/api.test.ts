import { describe, expect, test } from "vitest";
import {
  createScrapeBodySchema,
  dealsQuerySchema,
  historyQuerySchema,
  LIMITS,
  objectIdSchema,
  productsQuerySchema,
  suggestionsQuerySchema,
} from "../index.js";

describe("productsQuerySchema", () => {
  test("fills in defaults for an empty query", () => {
    expect(productsQuerySchema.parse({})).toEqual({
      discounted: false,
      sort: "relevance",
      page: 1,
      pageSize: 24,
    });
  });

  test.each([
    ["a comma list", { store: "demo-a,demo-b" }, ["demo-a", "demo-b"]],
    ["a repeated parameter", { store: ["demo-a", "demo-b"] }, ["demo-a", "demo-b"]],
    ["the same store twice", { store: ["demo-a", "demo-a"] }, ["demo-a"]],
  ])("reads stores from %s", (_name, query, stores) => {
    expect(productsQuerySchema.parse(query).store).toEqual(stores);
  });

  test("reads categories from a comma list or a repeated parameter", () => {
    expect(productsQuerySchema.parse({ category: "laptopi,mobiteli" }).category).toEqual([
      "laptopi",
      "mobiteli",
    ]);
    expect(productsQuerySchema.parse({ category: ["tableti", "tableti"] }).category).toEqual([
      "tableti",
    ]);
  });

  test("reads prices as whole euros and discounted as a strict boolean", () => {
    expect(productsQuerySchema.parse({ min: "100", max: "100", discounted: "true" })).toMatchObject(
      { min: 100, max: 100, discounted: true },
    );
    expect(productsQuerySchema.parse({ discounted: "false" }).discounted).toBe(false);
  });

  test("an empty price field means no limit, not 0 €", () => {
    const query = productsQuerySchema.parse({ min: "", max: "" });
    expect(query.min).toBeUndefined();
    expect(query.max).toBeUndefined();
  });

  test.each([
    { min: "200", max: "100" },
    { min: "-1" },
    { min: "1.5" },
    { max: "100001" },
    { discounted: "yes" },
    { store: "mall" },
    { store: "demo-a,mall" },
    { category: "auti" },
    { pageSize: "49" },
    { page: "0" },
    { page: "101" },
    { sort: "newest" },
    { q: "a" },
  ])("rejects %j", (query) => {
    expect(productsQuerySchema.safeParse(query).success).toBe(false);
  });

  test("tells the user when the lowest price is above the highest", () => {
    const result = productsQuerySchema.safeParse({ min: "200", max: "100" });
    expect(result.error?.issues[0]?.message).toBe("Najniža cijena ne može biti veća od najviše.");
  });
});

describe("historyQuerySchema", () => {
  test("defaults to LIMITS.historyDaysDefault days", () => {
    expect(historyQuerySchema.parse({})).toEqual({ days: LIMITS.historyDaysDefault });
  });

  test.each(["0", "366", "1.5"])("rejects days=%s", (days) => {
    expect(historyQuerySchema.safeParse({ days }).success).toBe(false);
  });
});

describe("dealsQuerySchema", () => {
  test("defaults to 12 and accepts up to LIMITS.dealsMax", () => {
    expect(dealsQuerySchema.parse({})).toEqual({ limit: 12 });
    expect(dealsQuerySchema.parse({ limit: "24" })).toEqual({ limit: 24 });
    expect(dealsQuerySchema.safeParse({ limit: "25" }).success).toBe(false);
  });
});

describe("suggestionsQuerySchema", () => {
  test("needs a search term of at least two characters", () => {
    expect(suggestionsQuerySchema.parse({ q: " Nord " })).toEqual({ q: "nord" });
    expect(suggestionsQuerySchema.safeParse({ q: "a" }).success).toBe(false);
    expect(suggestionsQuerySchema.safeParse({}).success).toBe(false);
  });
});

describe("productsQuerySchema lists and numbers", () => {
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
