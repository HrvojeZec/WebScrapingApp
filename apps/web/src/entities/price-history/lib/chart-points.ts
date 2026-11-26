import type { PricePointDto } from "@storeseeker/shared";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { CENTS_PER_EURO, DAY_MS } from "../model/constants";
import type { ChartPoint } from "../model/types";

/**
 * The points of a step chart over the last `days` days, in euros. The API's first point may be
 * older than the window (the price valid at its start), so it moves to the start; a last point at
 * `now` carries the current price, so the line reaches today.
 */
export function toChartPoints(points: PricePointDto[], now: Date, days: number): ChartPoint[] {
  const last = points[points.length - 1];
  if (!last) return [];
  const windowStart = now.getTime() - days * DAY_MS;
  const toPoint = (priceCents: number, date: number): ChartPoint => ({
    date,
    price: priceCents / CENTS_PER_EURO,
  });

  return [
    ...points.map((point) =>
      toPoint(point.priceCents, Math.max(new Date(point.observedAt).getTime(), windowStart)),
    ),
    toPoint(last.priceCents, now.getTime()),
  ];
}

/** A chart value in euros as `formatPrice` writes it; rounding drops the float error of `/ 100`. */
export function chartPriceText(euros: number): string {
  return formatPrice(Math.round(euros * CENTS_PER_EURO));
}

/**
 * A chart time in ms as `formatDate` writes it. The tooltip also asks with no point under the
 * pointer (undefined or ""), which would throw "Invalid time value"; that gives "".
 */
export function chartDateText(value: unknown): string {
  const time =
    typeof value === "number" || (typeof value === "string" && value !== "") ? Number(value) : NaN;
  return Number.isFinite(time) ? formatDate(new Date(time)) : "";
}
