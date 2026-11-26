import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api/base-api";
import { isMissingProduct } from "../missing-product";

describe("isMissingProduct", () => {
  it("treats an unknown id as a missing product", () => {
    expect(isMissingProduct(new ApiError("not_found", "Proizvod ne postoji.", 404))).toBe(true);
  });

  it("treats a malformed id as a missing product", () => {
    expect(isMissingProduct(new ApiError("validation_error", "Neispravan ID.", 400))).toBe(true);
  });

  it("leaves a dead API and other errors to the error state", () => {
    expect(isMissingProduct(new ApiError("unavailable", "HTML", 502))).toBe(false);
    expect(isMissingProduct(new ApiError("network", "offline", null))).toBe(false);
    expect(isMissingProduct(new Error("boom"))).toBe(false);
    expect(isMissingProduct(null)).toBe(false);
  });
});
