import type { StoreJobStatus } from "@storeseeker/shared";

/** What the UI says about one store of a job; `ok` shows the product count instead. */
export const STORE_JOB_TEXT: Record<Exclude<StoreJobStatus, "ok">, string> = {
  pending: "čeka na red",
  running: "osvježava se",
  partial: "djelomično osvježeno",
  blocked: "trgovina je odbila zahtjev",
  error: "osvježavanje nije uspjelo",
};
