import { describe, expect, test } from "vitest";
import { keywordSchema, normalizeKeyword } from "../index.js";

describe("normalizeKeyword", () => {
  test("trims, collapses whitespace and lowercases", () => {
    expect(normalizeKeyword("  Apple   iPhone 16 ")).toBe("apple iphone 16");
  });
});

describe("keywordSchema", () => {
  test("keeps Croatian diacritics while lowercasing", () => {
    expect(keywordSchema.parse("  ČAŠA ")).toBe("čaša");
  });

  test("accepts decomposed (NFD) letters as the same keyword", () => {
    const decomposed = "čaša".normalize("NFD");
    expect(decomposed).not.toBe("čaša");
    expect(keywordSchema.parse(decomposed)).toBe("čaša");
  });

  test("accepts letters, digits, spaces and - + . /", () => {
    expect(keywordSchema.parse("usb-c 2.0 / 65w+")).toBe("usb-c 2.0 / 65w+");
  });

  test("rejects a keyword shorter than 2 characters", () => {
    const result = keywordSchema.safeParse("a");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Upiši barem 2 znaka.");
  });

  test("rejects a keyword longer than 60 characters", () => {
    const result = keywordSchema.safeParse("a".repeat(61));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Upiši najviše 60 znakova.");
  });

  test.each(["iphone,16", "ip*", "<script>"])("rejects disallowed characters in %j", (raw) => {
    const result = keywordSchema.safeParse(raw);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Koristi samo slova, brojke, razmak i znakove - + . /",
    );
  });

  test("rejects values that are not strings", () => {
    expect(keywordSchema.safeParse({ $ne: null }).success).toBe(false);
  });
});
