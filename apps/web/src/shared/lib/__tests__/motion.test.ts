import { describe, expect, it } from "vitest";
import { MOTION } from "@/shared/theme/motion";
import { formatDiscount, formatPrice } from "../format";
import {
  cssEasing,
  HR_GROUP_SEPARATOR,
  productImageLayoutId,
  secondsToMs,
  splitNumber,
} from "../motion";

describe("productImageLayoutId", () => {
  it("names the shared product image after the product", () => {
    expect(productImageLayoutId("abc")).toBe("product-image-abc");
  });
});

describe("secondsToMs", () => {
  it("turns a motion duration into milliseconds for Mantine", () => {
    expect(secondsToMs(MOTION.duration.base)).toBe(250);
    expect(secondsToMs(MOTION.duration.fast)).toBe(150);
  });
});

describe("cssEasing", () => {
  it("writes the motion curve as a CSS timing function", () => {
    expect(cssEasing(MOTION.ease)).toBe("cubic-bezier(0.2, 0, 0, 1)");
  });
});

describe("splitNumber", () => {
  it("splits a price into its whole euros and the text around them", () => {
    expect(splitNumber("1.039,99 €")).toEqual({
      prefix: "",
      value: 1039,
      suffix: ",99 €",
    });
  });

  it("keeps the minus sign of a discount in front", () => {
    expect(splitNumber("−12 %")).toEqual({ prefix: "−", value: 12, suffix: " %" });
  });

  it("reads a number with several thousands groups", () => {
    expect(splitNumber("1.234.567")).toEqual({ prefix: "", value: 1234567, suffix: "" });
  });

  it("splits what format.ts writes, so the counter ends on the same text", () => {
    for (const text of [formatPrice(103999), formatPrice(1234567890), formatDiscount(12)]) {
      const parts = splitNumber(text);
      expect(parts).not.toBeNull();
      const grouped = String(parts?.value).replace(/\B(?=(\d{3})+(?!\d))/gu, HR_GROUP_SEPARATOR);
      expect(`${parts?.prefix}${grouped}${parts?.suffix}`).toBe(text);
    }
  });

  it("gives up on text without a number", () => {
    expect(splitNumber("bez cijene")).toBeNull();
  });
});
