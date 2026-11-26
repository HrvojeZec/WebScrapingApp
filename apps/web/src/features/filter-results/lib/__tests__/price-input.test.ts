import { describe, expect, it } from "vitest";
import { LIMITS } from "@storeseeker/shared";
import { eurosFromInput, followUrl, priceRangeError } from "../price-input";

describe("eurosFromInput", () => {
  it("reads whole euros", () => {
    expect(eurosFromInput("1039")).toEqual({ value: 1039 });
    expect(eurosFromInput(1039)).toEqual({ value: 1039 });
  });

  // NumberInput hands over its value unformatted, with "." as the decimal point; cents ending
  // in 0 come as a string ("10,500" typed → "10.500"), others as a number
  it("rejects cents that NumberInput hands over as a string", () => {
    expect(eurosFromInput("10.500")).toHaveProperty("error");
    expect(eurosFromInput("1.000")).toHaveProperty("error");
  });

  it("reads an empty field as no bound", () => {
    expect(eurosFromInput("")).toEqual({ value: undefined });
    expect(eurosFromInput("  ")).toEqual({ value: undefined });
  });

  it("rejects text, negative numbers and cents", () => {
    for (const input of ["abc", "-5", "10,5", 10.5, -5]) {
      expect(eurosFromInput(input)).toHaveProperty("error");
    }
  });

  it("rejects a price over the API's limit", () => {
    expect(eurosFromInput(LIMITS.priceFilterMaxEuros + 1)).toHaveProperty("error");
    expect(eurosFromInput(LIMITS.priceFilterMaxEuros)).toEqual({
      value: LIMITS.priceFilterMaxEuros,
    });
  });
});

describe("priceRangeError", () => {
  it("says the API's sentence when the lower bound is above the upper", () => {
    expect(priceRangeError(500, 100)).toBe("Najniža cijena ne može biti veća od najviše.");
  });

  it("accepts an open or equal range", () => {
    expect(priceRangeError(100, 100)).toBeUndefined();
    expect(priceRangeError(undefined, 100)).toBeUndefined();
    expect(priceRangeError(100, undefined)).toBeUndefined();
  });
});

describe("followUrl", () => {
  const drafts = { min: 500, max: "10", shown: { min: undefined, max: undefined } };

  it("keeps the drafts while the URL's range is the one they show", () => {
    expect(followUrl(drafts, undefined, undefined)).toBe(drafts);
  });

  // The lower bound was applied on blur while the upper one is being typed
  it("takes only the bound that changed in the URL", () => {
    expect(followUrl(drafts, 500, undefined)).toEqual({
      min: 500,
      max: "10",
      shown: { min: 500, max: undefined },
    });
  });

  it("empties a field whose bound left the URL", () => {
    const applied = { min: 500, max: 1500, shown: { min: 500, max: 1500 } };
    expect(followUrl(applied, undefined, undefined)).toEqual({
      min: "",
      max: "",
      shown: { min: undefined, max: undefined },
    });
  });
});
