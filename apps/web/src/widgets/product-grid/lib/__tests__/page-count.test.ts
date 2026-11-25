import { LIMITS } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { pageCount } from "../page-count";

describe("pageCount", () => {
  it("rounds a partial last page up", () => {
    expect(pageCount(0, 24)).toBe(0);
    expect(pageCount(24, 24)).toBe(1);
    expect(pageCount(25, 24)).toBe(2);
  });

  it("stops at the last page the API serves", () => {
    expect(pageCount(1_000_000, 24)).toBe(LIMITS.pageMax);
  });
});
