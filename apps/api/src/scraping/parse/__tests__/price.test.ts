import { describe, expect, test } from "vitest";
import { parsePriceCents } from "../price";

describe("parsePriceCents", () => {
  test.each([
    ["1.613,43 €", 161343],
    ["1.609 €", 160900],
    ["999,00 €", 99900],
    ["1 299,99 €", 129999],
    // Narrow no-break space (U+202F) and no-break space (U+00A0) as thousands separators
    ["1 299,99 €", 129999],
    ["1 299,99 €", 129999],
    ["\n  1.249,89 €\n", 124989],
    ["1.299,99 € / 9.788,27 kn", 129999],
    ["12,5 €", 1250],
  ])("%j is %i cents", (text, cents) => {
    expect(parsePriceCents(text)).toBe(cents);
  });

  test.each([["9.788,27 kn"], [""], ["Nedostupno"], ["0,00 €"], ["€"]])(
    "%j has no price",
    (text) => {
      expect(parsePriceCents(text)).toBeNull();
    },
  );
});
