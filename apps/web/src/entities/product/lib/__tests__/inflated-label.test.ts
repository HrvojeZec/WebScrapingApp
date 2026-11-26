import { describe, expect, it } from "vitest";
import { inflatedLabel } from "../inflated-label";

describe("inflatedLabel", () => {
  it("warns about a sale measured from an inflated price", () => {
    expect(inflatedLabel(true)).toBe("Sniženje u odnosu na napuhanu cijenu");
  });

  it("confirms a real sale", () => {
    expect(inflatedLabel(false)).toBe("Stvarno sniženje");
  });

  it("says nothing when the price is not a sale or there is no earlier price", () => {
    expect(inflatedLabel(null)).toBeNull();
  });
});
