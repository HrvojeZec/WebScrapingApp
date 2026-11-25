import type { ProductSort } from "@storeseeker/shared";

/** Prices change only when the worker crawls, so a minute old list is still right */
export const PRODUCTS_STALE_MS = 60 * 1000;

/** Two rows of four on a wide screen */
export const DEALS_HOME_LIMIT = 8;

export const PRODUCT_SORT_LABELS: Record<ProductSort, string> = {
  relevance: "Najrelevantnije",
  price_asc: "Najniža cijena",
  price_desc: "Najviša cijena",
  discount: "Najveće sniženje",
};

export const PRODUCT_CARD_TEXT = {
  toStore: "Pogledaj u trgovini",
  /** Read after the link text, since the store opens in a new tab */
  newTab: "(otvara se u novoj kartici)",
  unavailable: "Trenutno nije dostupno",
} as const;
