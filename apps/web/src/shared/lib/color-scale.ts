import { hexToRgb } from "./contrast";

/** Mantine's default primary shade in the light scheme; the token sits there unchanged. */
export const BASE_SHADE = 6;

// How far each shade moves toward white (before the base) or black (after it)
const TINTS = [0.92, 0.82, 0.68, 0.52, 0.36, 0.18];
const SHADES = [0.16, 0.32, 0.48];

const toHex = (channels: number[]) =>
  `#${channels
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;

/** Ten shades of a `#RRGGBB` color, light to dark, as Mantine expects them in `theme.colors`. */
export function colorScale(hex: string): string[] {
  const rgb = hexToRgb(hex);
  const mix = (target: number, amount: number) =>
    toHex(rgb.map((channel) => channel + (target - channel) * amount));
  return [
    ...TINTS.map((amount) => mix(255, amount)),
    toHex(rgb),
    ...SHADES.map((amount) => mix(0, amount)),
  ];
}
