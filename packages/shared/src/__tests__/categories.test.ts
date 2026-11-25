import { describe, expect, test } from "vitest";
import {
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
  DEMO_STORE_SLUGS,
  SHOP_SLUGS,
  STORE_SLUGS,
  categorySlugSchema,
  shopSlugSchema,
  storeSlugSchema,
} from "../index.js";

describe("CATEGORY_LABELS", () => {
  test("has a label for every category slug", () => {
    expect(Object.keys(CATEGORY_LABELS).sort()).toEqual([...CATEGORY_SLUGS].sort());
    for (const slug of CATEGORY_SLUGS) expect(CATEGORY_LABELS[slug]).not.toBe("");
  });

  test("labels headphones with the Croatian letter", () => {
    expect(CATEGORY_LABELS.slusalice).toBe("Slušalice");
  });

  test("categorySlugSchema rejects an unknown category", () => {
    expect(categorySlugSchema.safeParse("hladnjaci").success).toBe(false);
  });
});

describe("store slugs", () => {
  test("STORE_SLUGS holds every shop and every demo store", () => {
    expect([...STORE_SLUGS].sort()).toEqual([...SHOP_SLUGS, ...DEMO_STORE_SLUGS].sort());
  });

  test("a demo store is a store but not a shop", () => {
    expect(storeSlugSchema.safeParse("demo-a").success).toBe(true);
    expect(shopSlugSchema.safeParse("demo-a").success).toBe(false);
    expect(shopSlugSchema.safeParse("harveynorman").success).toBe(true);
  });
});
