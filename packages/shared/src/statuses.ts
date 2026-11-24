export const JOB_STATUSES = ["queued", "running", "succeeded", "partial", "failed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const STORE_RUN_STATUSES = ["ok", "empty", "blocked", "error"] as const;
export type StoreRunStatus = (typeof STORE_RUN_STATUSES)[number];

export const FETCH_METHODS = ["http", "browser"] as const;
export type FetchMethod = (typeof FETCH_METHODS)[number];

export const PRODUCT_SORTS = ["relevance", "price_asc", "price_desc", "discount"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];
