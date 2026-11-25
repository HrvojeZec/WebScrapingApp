import type { JobStatus } from "@storeseeker/shared";

const FINISHED: ReadonlySet<JobStatus> = new Set(["succeeded", "partial", "failed"]);

/** Whether a job is done for good, so polling can stop. */
export function isJobFinished(status: JobStatus): boolean {
  return FINISHED.has(status);
}
