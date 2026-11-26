import { QueryClient, type DefaultOptions } from "@tanstack/react-query";
import { WEB_LIMITS } from "@/shared/constants/limits";
import { ApiError } from "./base-api";
import { HTTP_STATUS } from "./http-status";

/**
 * A 4xx is the API's answer and stays the same on a repeat. No response, or one that is not the
 * API's JSON (the dev proxy's 502), means the API is not running, which a repeat cannot fix. Only
 * the API's own server error may be passing.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.code === "network" || error.code === "unavailable") return false;
    if (
      error.status !== null &&
      error.status >= HTTP_STATUS.badRequest &&
      error.status < HTTP_STATUS.internalServerError
    ) {
      return false;
    }
  }
  return failureCount < WEB_LIMITS.queryRetries;
}

/** The app's query defaults, exported so tests run queries the way the app does. */
export const QUERY_DEFAULTS = {
  queries: { retry: shouldRetry, refetchOnWindowFocus: false },
  mutations: { retry: false },
} satisfies DefaultOptions;

// Query errors are shown by the component that reads the query, never by a global toast (E2)
export const queryClient = new QueryClient({ defaultOptions: QUERY_DEFAULTS });
