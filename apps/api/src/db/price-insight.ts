import { LIMITS } from "@storeseeker/shared";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = LIMITS.lowestPriceWindowDays * DAY_MS;

export type PriceSample = {
  priceCents: number;
  regularPriceCents: number | null;
  observedAt: Date;
};

export type PriceInsight = {
  lowest30dCents: number;
  historySince: Date;
  /** null when the price is not a sale, or when there is no price from before the sale. */
  inflatedDiscount: boolean | null;
};

function isSale(point: PriceSample): boolean {
  return point.regularPriceCents !== null && point.regularPriceCents > point.priceCents;
}

// History has a point only when the price changes, so the last point at or before the start
// of the window is the price that was valid then and counts too
function lowestInWindow(points: PriceSample[], end: Date): number {
  const start = end.getTime() - WINDOW_MS;
  let lowest = Infinity;
  for (const [index, point] of points.entries()) {
    const next = points[index + 1];
    const stillValidAtStart = next === undefined || next.observedAt.getTime() > start;
    if (stillValidAtStart) lowest = Math.min(lowest, point.priceCents);
  }
  return lowest;
}

/** points: ascending by observedAt, at least one; the last one is the current price. */
export function priceInsight(points: PriceSample[], now: Date): PriceInsight {
  const first = points[0];
  const current = points.at(-1);
  if (first === undefined || current === undefined) {
    throw new Error("priceInsight needs at least one price point");
  }

  let inflatedDiscount: boolean | null = null;
  if (isSale(current)) {
    let saleStart = points.length - 1;
    while (saleStart > 0 && isSale(points[saleStart - 1]!)) saleStart -= 1;
    const beforeSale = points.slice(0, saleStart);
    if (beforeSale.length > 0) {
      const lowestBefore = lowestInWindow(beforeSale, points[saleStart]!.observedAt);
      inflatedDiscount = current.regularPriceCents! > lowestBefore;
    }
  }

  return {
    lowest30dCents: lowestInWindow(points, now),
    historySince: first.observedAt,
    inflatedDiscount,
  };
}
