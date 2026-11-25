import { describe, expect, it } from "vitest";
import { isOnSale } from "../price";

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
