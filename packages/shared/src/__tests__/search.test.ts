import { describe, expect, test } from "vitest";
import { normalizeSearchTerm, searchTermSchema, toSearchText } from "../index.js";

describe("toSearchText", () => {
  test("drops diacritics, lowercases and collapses whitespace", () => {
    expect(toSearchText("  Slušalice  ČEŠĆE Đak ")).toBe("slusalice cesce dak");
  });

  test("gives the same text for decomposed (NFD) input", () => {
    const decomposed = "Slušalice ČEŠĆE Đak".normalize("NFD");
    expect(decomposed).not.toBe("Slušalice ČEŠĆE Đak");
    expect(toSearchText(decomposed)).toBe(toSearchText("Slušalice ČEŠĆE Đak"));
  });

  test("turns đ into d, which NFD does not decompose", () => {
    expect(toSearchText("ĐAK")).toBe(toSearchText("dak"));
  });
});

describe("normalizeSearchTerm", () => {
  test("trims, collapses whitespace and lowercases", () => {
    expect(normalizeSearchTerm("  Apple   iPhone 16 ")).toBe("apple iphone 16");
  });
});

describe("searchTermSchema", () => {
  test("keeps Croatian diacritics while lowercasing", () => {
    expect(searchTermSchema.parse("  ČAŠA ")).toBe("čaša");
  });

  test("accepts decomposed (NFD) letters as the same term", () => {
    const decomposed = "čaša".normalize("NFD");
    expect(decomposed).not.toBe("čaša");
    expect(searchTermSchema.parse(decomposed)).toBe("čaša");
  });

  test("accepts letters, digits, spaces and - + . /", () => {
    expect(searchTermSchema.parse("usb-c 2.0 / 65w+")).toBe("usb-c 2.0 / 65w+");
  });

  test("rejects a term shorter than 2 characters", () => {
    const result = searchTermSchema.safeParse("a");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Upiši barem 2 znaka.");
  });

  test("rejects a term longer than 60 characters", () => {
    const result = searchTermSchema.safeParse("a".repeat(61));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Upiši najviše 60 znakova.");
  });

  test.each(["iphone,16", "ab*", "<script>"])("rejects disallowed characters in %j", (raw) => {
    const result = searchTermSchema.safeParse(raw);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Koristi samo slova, brojke, razmak i znakove - + . /",
    );
  });

  test("rejects values that are not strings", () => {
    expect(searchTermSchema.safeParse({ $ne: null }).success).toBe(false);
  });
});
