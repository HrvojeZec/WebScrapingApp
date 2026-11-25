import { describe, expect, test } from "vitest";
import { priceInsight, type PriceSample } from "../price-insight";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-11-25T12:00:00Z");

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * DAY_MS);
}

function point(days: number, priceCents: number, regularPriceCents: number | null = null) {
  return { priceCents, regularPriceCents, observedAt: daysAgo(days) } satisfies PriceSample;
}

describe("priceInsight", () => {
  test("a sale from a price that held for 60 days is not inflated", () => {
    const points = [point(60, 10_000), point(0, 8_000, 10_000)];
    expect(priceInsight(points, NOW).inflatedDiscount).toBe(false);
  });

  test("a sale from a price raised shortly before it is inflated", () => {
    const points = [point(50, 8_000), point(10, 10_000), point(0, 8_000, 10_000)];
    expect(priceInsight(points, NOW).inflatedDiscount).toBe(true);
  });

  test("a sale with no price before it gives no verdict", () => {
    const points = [point(20, 8_000, 10_000), point(5, 7_500, 10_000)];
    expect(priceInsight(points, NOW).inflatedDiscount).toBeNull();
  });

  test("a current price that is not a sale gives no verdict", () => {
    const points = [point(20, 8_000, 10_000), point(5, 9_000)];
    expect(priceInsight(points, NOW).inflatedDiscount).toBeNull();
    expect(priceInsight([point(5, 9_000, 9_000)], NOW).inflatedDiscount).toBeNull();
  });

  test("the lowest price counts the price still valid at the start of the window", () => {
    const points = [point(40, 7_000), point(10, 9_000)];
    expect(priceInsight(points, NOW).lowest30dCents).toBe(7_000);
  });

  test("ignores prices that ended before the window", () => {
    const points = [point(50, 5_000), point(40, 7_000), point(10, 9_000)];
    expect(priceInsight(points, NOW).lowest30dCents).toBe(7_000);
  });

  test("a short history uses all its points and starts at the first one", () => {
    const points = [point(10, 9_000), point(5, 8_500), point(1, 9_500)];
    expect(priceInsight(points, NOW)).toEqual({
      lowest30dCents: 8_500,
      historySince: daysAgo(10),
      inflatedDiscount: null,
    });
  });

  test("throws on an empty history", () => {
    expect(() => priceInsight([], NOW)).toThrow();
  });
});
