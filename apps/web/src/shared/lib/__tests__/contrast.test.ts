import { describe, expect, it } from "vitest";
import { COLORS, TEXT_PAIRS } from "@/shared/theme/tokens";
import { contrastRatio } from "../contrast";

// WCAG 2.x AA for normal text
const AA = 4.5;

describe("contrastRatio", () => {
  it("is 21 for black on white and the same in both directions", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 2);
  });

  it("is 1 for a color on itself", () => {
    expect(contrastRatio("#1C2B45", "#1c2b45")).toBeCloseTo(1, 5);
  });

  it("shows why the green of Pad cannot be text on paper", () => {
    expect(contrastRatio(COLORS.drop, COLORS.paper)).toBeLessThan(AA);
  });

  it("rejects a color that is not #RRGGBB", () => {
    expect(() => contrastRatio("red", "#FFFFFF")).toThrow(/#RRGGBB/);
  });
});

describe("text color pairs of the design system", () => {
  it.each(TEXT_PAIRS)("%s on %s passes WCAG AA", (foreground, background) => {
    expect(contrastRatio(COLORS[foreground], COLORS[background])).toBeGreaterThanOrEqual(AA);
  });

  it("covers the pairs docs/design-system.md promises", () => {
    expect(TEXT_PAIRS).toEqual(
      expect.arrayContaining([
        ["ink", "paper"],
        ["ink", "shelf"],
        ["ink", "tag"],
        ["rise", "paper"],
        ["dropText", "paper"],
        ["paper", "ink"],
      ]),
    );
  });
});
