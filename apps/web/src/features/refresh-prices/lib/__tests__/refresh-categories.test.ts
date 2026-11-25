import { CATEGORY_SLUGS, type CategorySlug, type FacetCount } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { refreshCategories } from "../refresh-categories";

describe("refreshCategories", () => {
  it("refreshes the categories the user filtered by", () => {
    expect(refreshCategories(["laptopi"], [{ value: "tableti", count: 3 }])).toEqual(["laptopi"]);
  });

  it("otherwise refreshes the categories the results come from", () => {
    const facets: FacetCount<CategorySlug>[] = [
      { value: "slusalice", count: 12 },
      { value: "mobiteli", count: 0 },
      { value: "tableti", count: 1 },
    ];
    expect(refreshCategories(undefined, facets)).toEqual(["slusalice", "tableti"]);
  });

  it("refreshes every category when there is nothing to go by", () => {
    expect(refreshCategories([], [])).toEqual([...CATEGORY_SLUGS]);
  });
});
