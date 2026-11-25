// Design tokens of the web app. docs/design-system.md describes each one; keep the two in sync.

/** Every color has one meaning; see docs/design-system.md. */
export const COLORS = {
  /** Text, header, primary button */
  ink: "#1C2B45",
  /** Background of the page and the cards */
  paper: "#FFFFFF",
  /** Background of sections and fields */
  shelf: "#F3F5F8",
  /** Sale badge and "lowest price", only next to prices */
  tag: "#FFD23F",
  /** Price went down, real sale: surfaces and icons only, it fails AA as text */
  drop: "#1E8E5A",
  /** The drop green darkened until it passes AA as text on paper and shelf */
  dropText: "#1A7D4F",
  /** Price went up, errors */
  rise: "#C8372D",
  /** The logo only */
  brand: "#F26B3A",
  /** Secondary text such as the old price and the store name */
  muted: "#5A6478",
  /** 1 px borders of cards and fields */
  line: "#E2E6EC",
} as const;

export type ColorName = keyof typeof COLORS;

/**
 * How far each of Mantine's ten shades moves from the token toward white (shades 0 to 5) or
 * black (shades 7 to 9); the token itself is shade 6.
 */
export const SHADE_MIX = {
  tints: [0.92, 0.82, 0.68, 0.52, 0.36, 0.18],
  shades: [0.16, 0.32, 0.48],
} as const;

/** Foreground and background pairs used for text; each must pass WCAG AA (4.5:1). */
export const TEXT_PAIRS: readonly (readonly [ColorName, ColorName])[] = [
  ["ink", "paper"],
  ["ink", "shelf"],
  ["ink", "tag"],
  ["paper", "ink"],
  ["rise", "paper"],
  ["rise", "shelf"],
  ["dropText", "paper"],
  ["dropText", "shelf"],
  ["muted", "paper"],
  ["muted", "shelf"],
];

/** Type scale in px, ratio 1.25 with 16 as body text. */
export const FONT_SIZES = { xs: 12, sm: 14, md: 16, lg: 20, xl: 25, xxl: 31, xxxl: 39 } as const;

/** Corner radii in px: fields and buttons, cards. */
export const RADII = { field: 6, card: 10 } as const;

/** Every spacing is a multiple of this, in px. */
export const SPACING_STEP = 4;

/** Page layout in px. */
export const LAYOUT = {
  /** Widest the content gets; the default size of Mantine `Container` */
  contentMaxWidth: 1200,
} as const;

export const FONTS = {
  ui: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
  /** Prices and big numbers only, like a shelf label */
  price: '"IBM Plex Sans Condensed", "Arial Narrow", "IBM Plex Sans", sans-serif',
} as const;
