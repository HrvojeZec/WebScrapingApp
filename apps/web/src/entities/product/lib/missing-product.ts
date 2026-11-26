import { ApiError } from "@/shared/api/base-api";

/** An unknown id (404) and a malformed one (400) both mean the product is not there. */
export function isMissingProduct(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.code === "not_found" || error.code === "validation_error")
  );
}
