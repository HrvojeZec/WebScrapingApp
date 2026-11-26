import type { PricePointDto } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { formatPrice } from "@/shared/lib/format";
import { chartDateText, chartPriceText, toChartPoints } from "../chart-points";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date("2026-11-26T12:00:00Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * DAY_MS);

const point = (priceCents: number, observedAt: Date): PricePointDto => ({
  priceCents,
  regularPriceCents: null,
  observedAt: observedAt.toISOString(),
});

describe("toChartPoints", () => {
  it("draws one point from yesterday up to now at the same price", () => {
    expect(toChartPoints([point(99900, daysAgo(1))], now, 90)).toEqual([
      { date: daysAgo(1).getTime(), price: 999 },
      { date: now.getTime(), price: 999 },
    ]);
  });

  it("moves a point older than the window to the start of the window", () => {
    const [first] = toChartPoints([point(99900, daysAgo(120)), point(89900, daysAgo(5))], now, 90);
    expect(first).toEqual({ date: daysAgo(90).getTime(), price: 999 });
  });

  it("ends the line at now with the last price", () => {
    const points = toChartPoints([point(99900, daysAgo(10)), point(89990, daysAgo(2))], now, 90);
    expect(points[points.length - 1]).toEqual({ date: now.getTime(), price: 899.9 });
    expect(points).toHaveLength(3);
  });

  it("gives no points for no history", () => {
    expect(toChartPoints([], now, 90)).toEqual([]);
  });
});

describe("chartPriceText", () => {
  it("writes a chart price in euros as the price tag does", () => {
    expect(chartPriceText(899.9)).toBe(formatPrice(89990));
  });

  it("rounds away the float error of cents turned into euros", () => {
    expect(chartPriceText(1039.99)).toBe(formatPrice(103999));
  });
});

describe("chartDateText", () => {
  it("writes a chart time as a Croatian date", () => {
    expect(chartDateText(new Date("2026-11-01T09:00:00Z").getTime())).toBe("1. 11. 2026.");
  });

  it("gives an empty text for what the tooltip passes without a point", () => {
    expect(chartDateText(undefined)).toBe("");
    expect(chartDateText("")).toBe("");
    expect(chartDateText(Number.NaN)).toBe("");
  });
});
