import type { CategorySlug, ScrapeJobDto, StoreSlug } from "@storeseeker/shared";
import type { ScrapeJobDocument } from "../../db/models/scrape-job";

/** Only what the web shows: priority and the job-level error stay internal. */
export function toScrapeJobDto(
  job: ScrapeJobDocument,
  live: { queuePosition: number | null; workerOnline: boolean },
): ScrapeJobDto {
  return {
    id: job.id as string,
    kind: job.kind,
    source: job.source,
    status: job.status,
    categories: job.categories as CategorySlug[],
    perStore: job.perStore.map((part) => ({
      storeSlug: part.storeSlug as StoreSlug,
      status: part.status,
      pages: part.pages,
      products: part.products,
      error: part.error ?? null,
    })),
    createdAt: job.createdAt.toISOString(),
    startedAt: job.startedAt?.toISOString() ?? null,
    finishedAt: job.finishedAt?.toISOString() ?? null,
    queuePosition: live.queuePosition,
    workerOnline: live.workerOnline,
  };
}
