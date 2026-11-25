import { describe, expect, it } from "vitest";
import { isOnSale, shownDiscount } from "../price";

describe("shownDiscount", () => {
  it("gives the discount in whole percent", () => {
    expect(shownDiscount(12.6)).toBe(13);
  });

  it("hides a discount that rounds below one percent", () => {
    expect(shownDiscount(0)).toBeNull();
    expect(shownDiscount(0.4)).toBeNull();
  });

  it("hides a discount that is not a number", () => {
    expect(shownDiscount(Number.NaN)).toBeNull();
  });
});

describe("isOnSale", () => {
  it("is true when the price is below the regular price", () => {
    expect(isOnSale(100, 120)).toBe(true);
  });

  it("is false when the price equals the regular price", () => {
    expect(isOnSale(100, 100)).toBe(false);
  });

  it("is false without a regular price", () => {
    expect(isOnSale(100, null)).toBe(false);
  });

  it("is false when the regular price is lower, which is no sale", () => {
    expect(isOnSale(120, 100)).toBe(false);
  });
});
