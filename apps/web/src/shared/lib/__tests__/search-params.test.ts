import { describe, expect, it } from "vitest";
import {
  parseSearchParams,
  searchTermAsTyped,
  toSearchParams,
  type SearchState,
} from "../search-params";

const parse = (query: string) => parseSearchParams(new URLSearchParams(query));

describe("parseSearchParams", () => {
  it("reads a valid search", () => {
    const { state, issues } = parse("q=Slušalice&store=demo-a,demo-b&page=2");
    expect(state).toEqual({
      q: "slušalice",
      store: ["demo-a", "demo-b"],
      discounted: false,
      sort: "relevance",
      page: 2,
    });
    expect(issues).toEqual([]);
  });

  it("reads repeated store and category parameters", () => {
    const { state } = parse("store=demo-a&store=demo-c&category=laptopi&category=tableti");
    expect(state.store).toEqual(["demo-a", "demo-c"]);
    expect(state.category).toEqual(["laptopi", "tableti"]);
  });

  it("drops an invalid page and keeps the rest", () => {
    const { state, issues } = parse("page=abc&q=tv");
    expect(state.page).toBe(1);
    expect(state.q).toBe("tv");
    expect(issues).toHaveLength(1);
    expect(issues[0]?.path).toBe("page");
  });

  it("drops an unknown store and keeps the term", () => {
    const { state, issues } = parse("store=nepostoji&q=tv");
    expect(state.q).toBe("tv");
    expect(state.store).toBeUndefined();
    expect(issues.map((issue) => issue.path)).toEqual(["store"]);
  });

  it("drops both prices when the lowest is above the highest", () => {
    const { state, issues } = parse("min=50&max=10&q=tv");
    expect(issues).toEqual([
      { path: "min", message: "Najniža cijena ne može biti veća od najviše." },
    ]);
    expect(state.min).toBeUndefined();
    expect(state.max).toBeUndefined();
    expect(state.q).toBe("tv");
  });

  it("survives every kind of broken parameter at once", () => {
    const { state, issues } = parse("page=abc&min=50&max=10&store=nepostoji&sort=x&q=a");
    expect(state).toEqual({ discounted: false, sort: "relevance", page: 1 });
    expect(issues.map((issue) => issue.path).sort()).toEqual(["min", "page", "q", "sort", "store"]);
  });

  it("ignores pageSize and unknown parameters", () => {
    const { state, issues } = parse("pageSize=48&utm_source=x&q=tv");
    expect(state).toEqual({ q: "tv", discounted: false, sort: "relevance", page: 1 });
    expect(issues).toEqual([]);
  });
});

describe("toSearchParams", () => {
  it("leaves out the default values", () => {
    const params = toSearchParams({
      q: "tv",
      sort: "relevance",
      page: 1,
      discounted: false,
      store: [],
    });
    expect(params.toString()).toBe("q=tv");
  });

  it("gives back the same state when parsed again", () => {
    const state: SearchState = {
      q: "slušalice",
      category: ["slusalice", "tableti"],
      store: ["demo-a", "demo-b"],
      min: 10,
      max: 500,
      discounted: true,
      sort: "price_asc",
      page: 3,
    };
    expect(parseSearchParams(toSearchParams(state)).state).toEqual(state);
  });
});

describe("searchTermAsTyped", () => {
  it("keeps the letter case the user typed", () => {
    expect(searchTermAsTyped(new URLSearchParams("q=%20Slušalice%20%20Sony%20"))).toBe(
      "Slušalice Sony",
    );
  });

  it("is undefined when the term is missing or invalid", () => {
    expect(searchTermAsTyped(new URLSearchParams(""))).toBeUndefined();
    expect(searchTermAsTyped(new URLSearchParams("q=a"))).toBeUndefined();
  });
});
