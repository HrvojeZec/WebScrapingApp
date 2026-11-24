import { parseKeyword } from "../src/router/scrapeExecute/keyword";

describe("parseKeyword", () => {
  test("returns the trimmed keyword for a non-empty string", () => {
    expect(parseKeyword("  iphone 16 ")).toBe("iphone 16");
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
