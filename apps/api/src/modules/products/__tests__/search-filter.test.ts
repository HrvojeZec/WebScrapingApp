import { describe, expect, test } from "vitest";
import { escapeRegExp, searchTermsMatch } from "../search-filter";

describe("escapeRegExp", () => {
  test("makes regex characters literal", () => {
    expect(escapeRegExp("a.b+c")).toBe("a\\.b\\+c");
  });

  test("leaves letters, digits and spaces alone", () => {
    expect(escapeRegExp("galaxy s24")).toBe("galaxy s24");
  });
});

describe("searchTermsMatch", () => {
  test("needs every word of the term, without diacritics and in lower case", () => {
    expect(searchTermsMatch("Slušalice  SONY")).toEqual({
      $and: [{ searchText: { $regex: "slusalice" } }, { searchText: { $regex: "sony" } }],
    });
  });

  test("escapes each word", () => {
    expect(searchTermsMatch("a.b")).toEqual({ $and: [{ searchText: { $regex: "a\\.b" } }] });
  });
});
