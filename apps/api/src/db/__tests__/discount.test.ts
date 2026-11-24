import { describe, expect, test } from "vitest";
import { discountPercent } from "../discount";

describe("discountPercent", () => {
  test("rounds the discount down to a whole percent", () => {
    // 100 * 30000 / 149999 = 20.0001..., so a rounding up would show 21
    expect(discountPercent(119999, 149999)).toBe(20);
  });

  test("is 0 without a regular price", () => {
    expect(discountPercent(100, null)).toBe(0);
  });

  test("is 0 when the regular price equals the price", () => {
    expect(discountPercent(100, 100)).toBe(0);
  });

  test("is 0 when the regular price is lower than the price", () => {
    expect(discountPercent(100, 90)).toBe(0);
  });
});
