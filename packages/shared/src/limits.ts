const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;

export const LIMITS = {
  keywordCacheTtlMs: 6 * HOUR_MS,
  dailyScrapesPerIp: 5,
  dailyScrapesPerUser: 20,
  dailyScrapesGlobal: 300,
  concurrentJobsPerRequester: 1,
  pagesPerStore: 2,
  requestIntervalMs: 2_000,
  wishlistMax: 20,
  priceChecksPerDay: 2,
  loginAttempts: { max: 10, windowMs: 15 * MINUTE_MS },
  jobTimeoutMs: 90_000,
  // Without it a job waits forever while the worker is off and blocks the requester's next search
  jobQueueTimeoutMs: 15 * MINUTE_MS,
  workerOfflineAfterMs: 2 * MINUTE_MS,
  scrapePollIntervalMs: 1_500,
  pageSizeDefault: 24,
  pageSizeMax: 48,
  keywordMinLength: 2,
  keywordMaxLength: 60,
  limitTimeZone: "Europe/Zagreb",
} as const;
