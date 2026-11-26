import type { DealsDto, ProductDetailDto, ProductDto, ProductsPageDto } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { findCachedProduct } from "../cached-product";

const product = (id: string): ProductDto => ({
  id,
  storeSlug: "demo-a",
  storeName: "Demo trgovina A",
  title: `Telefon ${id}`,
  url: `https://example.com/${id}`,
  imageUrl: null,
  priceCents: 99900,
  regularPriceCents: null,
  discountPercent: 0,
  currency: "EUR",
  available: true,
  categories: ["mobiteli"],
  lastSeenAt: "2026-11-26T10:00:00Z",
});

const page = (...items: ProductDto[]): ProductsPageDto => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 24,
  facets: { stores: [], categories: [] },
});

const deals = (...items: ProductDto[]): DealsDto => ({
  items: items.map((item) => ({ product: item, inflatedDiscount: null })),
});

const detail = (main: ProductDto, same: ProductDto[] = []): ProductDetailDto => ({
  product: main,
  insight: { lowest30dCents: 99900, historySince: "2026-11-01T00:00:00Z", inflatedDiscount: null },
  sameProducts: same,
  similarProducts: [],
});

describe("findCachedProduct", () => {
  it("finds a product in a cached search page", () => {
    expect(findCachedProduct([page(product("a"), product("b"))], "b")).toEqual(product("b"));
  });

  it("finds a product in cached deals", () => {
    expect(findCachedProduct([deals(product("a"))], "a")).toEqual(product("a"));
  });

  it("finds a product on another product's page", () => {
    expect(findCachedProduct([detail(product("a"), [product("c")])], "c")).toEqual(product("c"));
    expect(findCachedProduct([detail(product("a"))], "a")).toEqual(product("a"));
  });

  it("skips data of other shapes and gives null when the product is nowhere", () => {
    expect(
      findCachedProduct([undefined, { suggestions: ["a"] }, page(product("a"))], "x"),
    ).toBeNull();
    expect(findCachedProduct([], "a")).toBeNull();
  });
});
