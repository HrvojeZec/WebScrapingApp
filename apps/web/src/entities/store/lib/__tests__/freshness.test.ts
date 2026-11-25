import type { StoreDto } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { storeFreshness } from "../freshness";

const store = (overrides: Partial<StoreDto>): StoreDto => ({
  slug: "demo-a",
  name: "Demo trgovina A",
  baseUrl: "https://example.com",
  lastCrawledAt: null,
  lastRunStatus: null,
  ...overrides,
});

describe("storeFreshness", () => {
  it("says a store was never crawled", () => {
    expect(storeFreshness([store({})])).toEqual([
      { storeSlug: "demo-a", name: "Demo trgovina A", text: "još nije osvježeno" },
    ]);
  });

  it("gives the time of the last crawl in Zagreb time", () => {
    const [line] = storeFreshness([store({ lastCrawledAt: "2026-11-24T10:42:00Z" })]);
    expect(line?.text).toBe("cijene od 24. 11. 2026. u 11:42");
  });
});
