import { SHADE_MIX } from "@/shared/theme/tokens";
import { CHANNEL_MAX, hexToRgb } from "./contrast";

/** Mantine's default primary shade in the light scheme; the token sits there unchanged. */
export const BASE_SHADE = 6;

const HEX_RADIX = 16;
const HEX_DIGITS_PER_CHANNEL = 2;

const toHex = (channels: number[]) =>
  `#${channels
    .map((channel) => Math.round(channel).toString(HEX_RADIX).padStart(HEX_DIGITS_PER_CHANNEL, "0"))
    .join("")
    .toUpperCase()}`;

/** Ten shades of a `#RRGGBB` color, light to dark, as Mantine expects them in `theme.colors`. */
export function colorScale(hex: string): string[] {
  const rgb = hexToRgb(hex);
  const mix = (target: number, amount: number) =>
    toHex(rgb.map((channel) => channel + (target - channel) * amount));
  return [
    ...SHADE_MIX.tints.map((amount) => mix(CHANNEL_MAX, amount)),
    toHex(rgb),
    ...SHADE_MIX.shades.map((amount) => mix(0, amount)),
  ];
}
