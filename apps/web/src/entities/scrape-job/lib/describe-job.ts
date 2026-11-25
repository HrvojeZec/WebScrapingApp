import type { StoreJobDto } from "@storeseeker/shared";
import { countText, PRODUCT_FORMS } from "@/shared/lib/plural";
import { STORE_JOB_TEXT } from "../model/constants";

/** One store's progress in a refresh. The API's `error` is internal English and never shown. */
export function describeStoreJob(job: StoreJobDto): string {
  return job.status === "ok" ? countText(job.products, PRODUCT_FORMS) : STORE_JOB_TEXT[job.status];
}
