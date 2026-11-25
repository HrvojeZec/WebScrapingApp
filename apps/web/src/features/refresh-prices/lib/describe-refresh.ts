import type { ScrapeJobDto, StoreDto, StoreJobDto, StoreSlug } from "@storeseeker/shared";
import { describeStoreJob } from "@/entities/scrape-job/lib/describe-job";
import { ApiError } from "@/shared/api/base-api";
import { apiErrorMessage } from "@/shared/lib/api-error-message";
import { formatDateTime, formatTime } from "@/shared/lib/format";
import { countText } from "@/shared/lib/plural";
import { JOB_FORMS, JOB_STATUS_TEXT, REFRESH_TEXT } from "../model/constants";

/** The sentence under "Osvježi cijene" while a job waits, runs or after it finished. */
export function describeRefresh(job: ScrapeJobDto): string {
  if (job.status !== "queued") return JOB_STATUS_TEXT[job.status];
  // The worker runs on a home computer; while it is off the job just waits (design 5.3)
  if (!job.workerOnline) return REFRESH_TEXT.workerOffline;
  if (job.queuePosition !== null && job.queuePosition > 0) {
    return `U redu čekanja, ispred je još ${countText(job.queuePosition, JOB_FORMS)}.`;
  }
  return REFRESH_TEXT.next;
}

/** The answer when every asked category was crawled a moment ago, so nothing was queued. */
export function describeFresh(lastCrawledAt: string): string {
  return `Cijene su svježe, zadnje osvježavanje ${formatDateTime(lastCrawledAt)}.`;
}

/** Why a refresh could not start; for the refresh limit, when it can start again. */
export function describeRefreshError(error: unknown): string {
  if (error instanceof ApiError && error.code === "rate_limited") {
    const retry = error.resetAt
      ? `${REFRESH_TEXT.retryAt} ${formatTime(error.resetAt)}.`
      : REFRESH_TEXT.retryLater;
    return `${REFRESH_TEXT.rateLimited} ${retry}`;
  }
  return apiErrorMessage(error);
}

export type RefreshStoreLine = { storeSlug: StoreSlug; name: string; text: string };

/** One line per store of the job; a store the list does not know is shown by its slug. */
export function refreshStoreLines(perStore: StoreJobDto[], stores: StoreDto[]): RefreshStoreLine[] {
  const names = new Map(stores.map((store) => [store.slug, store.name]));
  return perStore.map((storeJob) => ({
    storeSlug: storeJob.storeSlug,
    name: names.get(storeJob.storeSlug) ?? storeJob.storeSlug,
    text: describeStoreJob(storeJob),
  }));
}
