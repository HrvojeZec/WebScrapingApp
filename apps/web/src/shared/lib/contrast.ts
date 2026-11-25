const HEX_COLOR = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

/** The largest value of an 8-bit sRGB channel. */
export const CHANNEL_MAX = 255;

/** The constants of WCAG 2.x relative luminance and contrast ratio. */
const WCAG = {
  linearThreshold: 0.04045,
  linearDivisor: 12.92,
  gammaOffset: 0.055,
  gammaDivisor: 1.055,
  gamma: 2.4,
  weights: { red: 0.2126, green: 0.7152, blue: 0.0722 },
  flare: 0.05,
} as const;

/** The sRGB channels of a `#RRGGBB` color, each from 0 to 255. */
export function hexToRgb(hex: string): [number, number, number] {
  const match = HEX_COLOR.exec(hex);
  if (!match) throw new Error(`Expected a #RRGGBB color, got "${hex}"`);
  return [parseInt(match[1]!, 16), parseInt(match[2]!, 16), parseInt(match[3]!, 16)];
}

/** Relative luminance as WCAG 2.x defines it. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const value = channel / CHANNEL_MAX;
    return value <= WCAG.linearThreshold
      ? value / WCAG.linearDivisor
      : ((value + WCAG.gammaOffset) / WCAG.gammaDivisor) ** WCAG.gamma;
  });
  const { red, green, blue } = WCAG.weights;
  return red * r! + green * g! + blue * b!;
}

/** WCAG 2.x contrast ratio of two `#RRGGBB` colors, from 1 to 21, in either order. */
export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter! + WCAG.flare) / (darker! + WCAG.flare);
}
