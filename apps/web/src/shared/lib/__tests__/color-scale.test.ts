import { describe, expect, it } from "vitest";
import { contrastRatio } from "../contrast";
import { BASE_SHADE, colorScale } from "../color-scale";

describe("colorScale", () => {
  const scale = colorScale("#1C2B45");

  it("gives ten #RRGGBB shades with the color itself at the base shade", () => {
    expect(scale).toHaveLength(10);
    for (const shade of scale) expect(shade).toMatch(/^#[0-9A-F]{6}$/);
    expect(scale[BASE_SHADE]).toBe("#1C2B45");
  });

  it("goes from light to dark", () => {
    const againstWhite = scale.map((shade) => contrastRatio(shade, "#FFFFFF"));
    for (let index = 1; index < againstWhite.length; index += 1) {
      expect(againstWhite[index]).toBeGreaterThan(againstWhite[index - 1]!);
    }
  });

  it("keeps the lightest shade a tint, not plain white", () => {
    expect(scale[0]).not.toBe("#FFFFFF");
  });
});
