export const DAY_MS = 24 * 60 * 60 * 1000;

export const CENTS_PER_EURO = 100;

/** The history changes only when the worker crawls, like the product itself */
export const HISTORY_STALE_MS = 60 * 1000;

export const PRICE_CHART_TEXT = {
  series: "Cijena",
  label: "Povijest cijene",
} as const;

/** Sizes of the price chart in px */
export const PRICE_CHART_SIZE = {
  height: 260,
  /** Room for "1.039,99 €" next to the axis */
  yAxisWidth: 88,
  /** The smallest gap between two dates under the chart, so they never overlap */
  minTickGap: 32,
  strokeWidth: 2,
} as const;
