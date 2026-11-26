import type { ProductDto } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { cheapestSame } from "../cheapest";

const product = (id: string, priceCents: number): ProductDto => ({
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
  available: true,
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
});
