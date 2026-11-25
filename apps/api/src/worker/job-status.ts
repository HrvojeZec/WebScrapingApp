import type { CrawlStatus, StoreJobStatus } from "@storeseeker/shared";

/** One store's result from the crawls of its categories in a job. */
export function storeStatusFrom(runs: CrawlStatus[]): CrawlStatus {
  if (runs.length === 0) return "error";
  if (runs.every((run) => run === "ok")) return "ok";
  if (runs.some((run) => run === "ok" || run === "partial")) return "partial";
  if (runs.some((run) => run === "blocked")) return "blocked";
  return "error";
}

/** The job's result from its stores' results. */
export function jobStatusFrom(perStore: StoreJobStatus[]): "succeeded" | "partial" | "failed" {
  if (perStore.length > 0 && perStore.every((status) => status === "ok")) return "succeeded";
  if (perStore.some((status) => status === "ok" || status === "partial")) return "partial";
  return "failed";
}
