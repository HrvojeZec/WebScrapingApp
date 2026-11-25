import { describe, expect, it } from "vitest";
import { WEB_LIMITS } from "@/shared/constants/limits";
import { ApiError } from "../base-api";
import { shouldRetry } from "../query-client";

describe("shouldRetry", () => {
  it("never repeats a request the API refused with a 4xx", () => {
    expect(shouldRetry(0, new ApiError("not_found", "Proizvod ne postoji.", 404))).toBe(false);
    expect(shouldRetry(0, new ApiError("rate_limited", "Previše zahtjeva.", 429))).toBe(false);
  });

  it("repeats a network failure and a 5xx up to the limit", () => {
    const down = new ApiError("unavailable", "Bad Gateway", 502);

    expect(shouldRetry(0, new ApiError("network", "Failed to fetch", null))).toBe(true);
    expect(shouldRetry(WEB_LIMITS.queryRetries - 1, down)).toBe(true);
    expect(shouldRetry(WEB_LIMITS.queryRetries, down)).toBe(false);
  });
});
