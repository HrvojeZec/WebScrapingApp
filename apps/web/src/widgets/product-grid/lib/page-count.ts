import { LIMITS } from "@storeseeker/shared";

/** Pages of a result; the API serves no page past LIMITS.pageMax. */
export function pageCount(total: number, pageSize: number): number {
  return Math.min(Math.ceil(total / pageSize), LIMITS.pageMax);
}
