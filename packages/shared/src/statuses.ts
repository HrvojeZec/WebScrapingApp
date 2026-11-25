export const JOB_KINDS = ["categories"] as const;
export type JobKind = (typeof JOB_KINDS)[number];

export const JOB_SOURCES = ["request", "schedule"] as const;
export type JobSource = (typeof JOB_SOURCES)[number];

export const JOB_STATUSES = ["queued", "running", "succeeded", "partial", "failed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Outcome of crawling one category of one store. */
export const CRAWL_STATUSES = ["ok", "partial", "blocked", "error"] as const;
export type CrawlStatus = (typeof CRAWL_STATUSES)[number];

export const STORE_JOB_STATUSES = ["pending", "running", ...CRAWL_STATUSES] as const;
export type StoreJobStatus = (typeof STORE_JOB_STATUSES)[number];

export const FETCH_METHODS = ["http", "browser"] as const;
export type FetchMethod = (typeof FETCH_METHODS)[number];

export const PRODUCT_SORTS = ["relevance", "price_asc", "price_desc", "discount"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];
