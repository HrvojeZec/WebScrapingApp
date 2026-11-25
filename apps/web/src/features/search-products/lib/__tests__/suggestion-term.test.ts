import { describe, expect, it } from "vitest";
import { LIMITS, searchTermSchema } from "@storeseeker/shared";
import { suggestionToTerm } from "../suggestion-term";

describe("suggestionToTerm", () => {
  it("drops the characters a search term may not have", () => {
    expect(suggestionToTerm('Samsung Galaxy S24, 256 GB (crni) 6.2"')).toBe(
      "samsung galaxy s24 256 gb crni 6.2",
    );
  });

  it("cuts a long product name to the longest allowed term, on a word", () => {
    const term = suggestionToTerm(`Televizor ${"Ultra HD ".repeat(20)}`);

    expect(term.length).toBeLessThanOrEqual(LIMITS.searchTermMaxLength);
    expect(term.endsWith(" ")).toBe(false);
    expect(term.split(" ").every((word) => ["televizor", "ultra", "hd"].includes(word))).toBe(true);
  });

  it("always gives a term the schema accepts", () => {
    for (const title of ["Slušalice Sony WH-1000XM5 / crne", "LG OLED55C4 (2024), 139 cm"]) {
      expect(searchTermSchema.safeParse(suggestionToTerm(title)).success).toBe(true);
    }
  });
});
