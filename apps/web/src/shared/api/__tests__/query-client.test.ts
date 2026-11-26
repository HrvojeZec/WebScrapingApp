import { describe, expect, it } from "vitest";
import { WEB_LIMITS } from "@/shared/constants/limits";
import { ApiError } from "../base-api";
import { shouldRetry } from "../query-client";

describe("shouldRetry", () => {
  it("never repeats a request the API refused with a 4xx", () => {
    expect(shouldRetry(0, new ApiError("not_found", "Proizvod ne postoji.", 404))).toBe(false);
    expect(shouldRetry(0, new ApiError("rate_limited", "Previše zahtjeva.", 429))).toBe(false);
  });

  it("repeats the API's own server error up to the limit", () => {
    const failed = new ApiError("internal_error", "Nešto je pošlo po zlu.", 500);

    expect(shouldRetry(WEB_LIMITS.queryRetries - 1, failed)).toBe(true);
    expect(shouldRetry(WEB_LIMITS.queryRetries, failed)).toBe(false);
  });

  it("does not repeat a request while the API is not running", () => {
    // The dev proxy answers 502 for a stopped API; a repeat a second later only adds console errors
    expect(shouldRetry(0, new ApiError("unavailable", "Bad Gateway", 502))).toBe(false);
    expect(shouldRetry(0, new ApiError("network", "Failed to fetch", null))).toBe(false);
  });
});
