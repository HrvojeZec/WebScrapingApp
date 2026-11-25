const MINUTE_MS = 60_000;

export const LIMITS = {
  requestIntervalMs: 5_000,
  // A crawl counts as complete only when it reaches the last page, so this must cover a category
  pagesPerCategory: 10,
  categoryCrawlTimeoutMs: 5 * MINUTE_MS,
  refreshCooldownMs: 30 * MINUTE_MS,
  refreshesPerIpPerHour: 3,
  wishlistMax: 20,
  priceChecksPerDay: 2,
  loginAttempts: { max: 10, windowMs: 15 * MINUTE_MS },
  workerOfflineAfterMs: 2 * MINUTE_MS,
  scrapePollIntervalMs: 1_500,
  pageSizeDefault: 24,
  pageSizeMax: 48,
  searchTermMinLength: 2,
  searchTermMaxLength: 60,
  historyDaysDefault: 90,
  historyDaysMax: 365,
  lowestPriceWindowDays: 30,
  suggestionsMax: 8,
  similarProductsMax: 4,
  dealsMax: 24,
  limitTimeZone: "Europe/Zagreb",
} as const;
