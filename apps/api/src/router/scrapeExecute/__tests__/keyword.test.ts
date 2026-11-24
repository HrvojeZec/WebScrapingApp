import { describe, expect, test } from "vitest";
import { parseKeyword } from "../keyword";

describe("parseKeyword", () => {
  test("returns the trimmed keyword for a non-empty string", () => {
    expect(parseKeyword("  iphone 16 ")).toBe("iphone 16");
  });

  test("normalizes the keyword like the web app does", () => {
    expect(parseKeyword("Čaša")).toBe("čaša");
    expect(parseKeyword("  Apple   iPhone ")).toBe("apple iphone");
  });

  test("rejects keywords the shared schema does not allow", () => {
    expect(parseKeyword("a")).toBeNull();
    expect(parseKeyword("iphone,16")).toBeNull();
    expect(parseKeyword("<script>")).toBeNull();
  });

  test("rejects a query operator object", () => {
    expect(parseKeyword({ $ne: null })).toBeNull();
  });

  test("rejects an empty or whitespace-only string", () => {
    expect(parseKeyword("")).toBeNull();
    expect(parseKeyword("   ")).toBeNull();
  });

  test("rejects values that are not strings", () => {
    expect(parseKeyword(undefined)).toBeNull();
    expect(parseKeyword(42)).toBeNull();
    expect(parseKeyword(["iphone"])).toBeNull();
  });
});
