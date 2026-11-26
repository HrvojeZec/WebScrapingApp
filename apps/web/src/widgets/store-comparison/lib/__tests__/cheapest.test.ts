import type { ProductDto } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { cheapestSame } from "../cheapest";

const product = (id: string, priceCents: number, available = true): ProductDto => ({
  id,
  storeSlug: "demo-a",
  storeName: "Demo trgovina A",
  title: "Telefon",
  url: `https://example.com/${id}`,
  imageUrl: null,
  priceCents,
  regularPriceCents: null,
  discountPercent: 0,
  currency: "EUR",
  available,
  categories: ["mobiteli"],
  lastSeenAt: "2026-11-26T10:00:00Z",
});

describe("cheapestSame", () => {
  it("gives nothing for no products", () => {
    expect(cheapestSame([])).toBeNull();
  });

  it("gives the id of the cheapest of the same products", () => {
    expect(cheapestSame([product("a", 99900), product("b", 89900), product("c", 94900)])).toBe("b");
  });

  it("gives the first in the list when prices are equal", () => {
    expect(cheapestSame([product("a", 99900), product("b", 89900), product("c", 89900)])).toBe("b");
  });

  it("skips a product nobody can buy, however cheap", () => {
    expect(cheapestSame([product("a", 49900, false), product("b", 52000)])).toBe("b");
  });

  it("gives nothing when none of the products can be bought", () => {
    expect(cheapestSame([product("a", 49900, false), product("b", 52000, false)])).toBeNull();
  });
});
