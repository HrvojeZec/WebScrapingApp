import { describe, expect, it } from "vitest";
import type { SearchState } from "@/shared/lib/search-params";
import { activeFilterCount, applyFilter, clearFilters, facetOptions, toggleSlug } from "../filters";

const base: SearchState = { discounted: false, sort: "relevance", page: 1 };

describe("applyFilter", () => {
  it("goes back to the first page when a filter changes", () => {
    expect(applyFilter({ ...base, page: 3 }, { discounted: true })).toEqual({
      ...base,
      page: 1,
      discounted: true,
    });
  });

  it("keeps the term and the sort", () => {
    const state: SearchState = { ...base, q: "tv", sort: "price_asc", page: 2 };
    expect(applyFilter(state, { min: 100 })).toMatchObject({
      q: "tv",
      sort: "price_asc",
      min: 100,
    });
  });
});

describe("toggleSlug", () => {
  it("removes a picked slug", () => {
    expect(toggleSlug(["demo-a"], "demo-a")).toEqual([]);
  });

  it("adds a slug to an empty list", () => {
    expect(toggleSlug(undefined, "demo-b")).toEqual(["demo-b"]);
  });

  it("keeps the other slugs in their order", () => {
    expect(toggleSlug(["demo-a", "demo-c"], "demo-b")).toEqual(["demo-a", "demo-c", "demo-b"]);
  });
});

describe("activeFilterCount", () => {
  it("counts each store, each price bound and the discount switch", () => {
    expect(
      activeFilterCount({ ...base, store: ["demo-a", "demo-b"], min: 100, discounted: true }),
    ).toBe(4);
  });

  it("counts nothing for a bare search", () => {
    expect(activeFilterCount({ ...base, q: "tv", sort: "price_desc", page: 4 })).toBe(0);
  });

  it("counts categories and an upper bound of 0 €", () => {
    expect(activeFilterCount({ ...base, category: ["laptopi", "tableti"], max: 0 })).toBe(3);
  });
});

describe("clearFilters", () => {
  it("drops every filter but keeps the term and the sort", () => {
    const state: SearchState = {
      q: "tv",
      store: ["demo-a"],
      category: ["televizori"],
      min: 10,
      max: 20,
      discounted: true,
      sort: "discount",
      page: 3,
    };
    expect(clearFilters(state)).toEqual({ q: "tv", sort: "discount", discounted: false, page: 1 });
  });

  // useSearchState spreads the change over the current search, so a filter left out would stay
  it("still drops every filter when spread over the current search", () => {
    const state: SearchState = {
      ...base,
      store: ["demo-a"],
      category: ["televizori"],
      min: 10,
      max: 20,
    };
    expect(activeFilterCount({ ...state, ...clearFilters(state) })).toBe(0);
  });
});

describe("facetOptions", () => {
  const labels = { "demo-a": "Demo A", "demo-b": "Demo B", "demo-c": "Demo C" } as const;

  it("lists every known value with its count, 0 when the facet leaves it out", () => {
    expect(
      facetOptions(["demo-a", "demo-b"], labels, [{ value: "demo-b", count: 7 }], undefined),
    ).toEqual([
      { value: "demo-a", label: "Demo A", count: 0, checked: false, disabled: true },
      { value: "demo-b", label: "Demo B", count: 7, checked: false, disabled: false },
    ]);
  });

  it("keeps a picked value with no products enabled, so it can be unpicked", () => {
    expect(facetOptions(["demo-a"], labels, [], ["demo-a"])).toEqual([
      { value: "demo-a", label: "Demo A", count: 0, checked: true, disabled: false },
    ]);
  });

  it("adds a value that only the facet or the selection knows, after the known ones", () => {
    expect(
      facetOptions(["demo-a"], labels, [{ value: "demo-c", count: 2 }], ["demo-b"]).map(
        (option) => option.value,
      ),
    ).toEqual(["demo-a", "demo-c", "demo-b"]);
  });
});
