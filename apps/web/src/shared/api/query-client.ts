import { QueryClient, type DefaultOptions } from "@tanstack/react-query";
import { WEB_LIMITS } from "@/shared/constants/limits";
import { ApiError } from "./base-api";
import { HTTP_STATUS } from "./http-status";

/** A 4xx is the API's answer and stays the same on a repeat; anything else may be passing. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (
    error instanceof ApiError &&
    error.status !== null &&
    error.status >= HTTP_STATUS.badRequest &&
    error.status < HTTP_STATUS.internalServerError
  ) {
    return false;
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
