const HEX_COLOR = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

/** The sRGB channels of a `#RRGGBB` color, each from 0 to 255. */
export function hexToRgb(hex: string): [number, number, number] {
  const match = HEX_COLOR.exec(hex);
  if (!match) throw new Error(`Expected a #RRGGBB color, got "${hex}"`);
  return [parseInt(match[1]!, 16), parseInt(match[2]!, 16), parseInt(match[3]!, 16)];
}

/** Relative luminance as WCAG 2.x defines it. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG 2.x contrast ratio of two `#RRGGBB` colors, from 1 to 21, in either order. */
export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter! + 0.05) / (darker! + 0.05);
}
