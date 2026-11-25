import { describe, expect, it } from "vitest";
import { searchHeading } from "../search-heading";

describe("searchHeading", () => {
  it("quotes the term as the user typed it", () => {
    expect(searchHeading({ term: "Slušalice Sony", discounted: false })).toBe("„Slušalice Sony“");
  });

  it("names the categories when there is no term", () => {
    expect(searchHeading({ category: ["tableti"], discounted: false })).toBe("Tableti");
    expect(searchHeading({ category: ["laptopi", "tableti"], discounted: false })).toBe(
      "Laptopi i tableti",
    );
  });

  it("says when only sales are shown", () => {
    expect(searchHeading({ discounted: true })).toBe("Proizvodi na sniženju");
  });

  it("falls back to all products", () => {
    expect(searchHeading({ discounted: false })).toBe("Svi proizvodi");
  });
});
