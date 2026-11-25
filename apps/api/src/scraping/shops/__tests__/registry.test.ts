import { describe, expect, test } from "vitest";
import { SHOP_SLUGS } from "@storeseeker/shared";
import { STORES } from "../../../db/stores";
import { SHOP_ADAPTERS } from "../registry";

describe("SHOP_ADAPTERS", () => {
  test.each(SHOP_SLUGS)("%s has the origin of its store", (slug) => {
    const store = STORES.find((candidate) => candidate.slug === slug);
    expect(SHOP_ADAPTERS[slug].slug).toBe(slug);
    expect(SHOP_ADAPTERS[slug].origin).toBe(store?.baseUrl);
  });

  test.each(SHOP_SLUGS)("%s lists categories on its own origin, never search pages", (slug) => {
    const adapter = SHOP_ADAPTERS[slug];
    const lists = Object.values(adapter.categories);
    expect(lists.length).toBeGreaterThan(0);
    for (const list of lists) expect(list.length).toBeGreaterThan(0);
    const urls = lists.flat();
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(new URL(url).origin).toBe(adapter.origin);
      expect(url).not.toContain("catalogsearch");
    }
  });
});
