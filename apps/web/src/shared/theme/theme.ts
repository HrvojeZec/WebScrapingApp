import {
  Card,
  createTheme,
  rem,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";
import { BASE_SHADE, colorScale } from "@/shared/lib/color-scale";
import { COLORS, FONT_SIZES, FONTS, RADII, SPACING_STEP } from "./tokens";
import classes from "./theme.module.scss";

const scale = (hex: string) => colorScale(hex) as unknown as MantineColorsTuple;
const space = (steps: number) => rem(SPACING_STEP * steps);

export const theme = createTheme({
  colors: {
    ink: scale(COLORS.ink),
    tag: scale(COLORS.tag),
    drop: scale(COLORS.drop),
    rise: scale(COLORS.rise),
    brand: scale(COLORS.brand),
  },
  primaryColor: "ink",
  primaryShade: BASE_SHADE,
  black: COLORS.ink,
  white: COLORS.paper,
  fontFamily: FONTS.ui,
  headings: {
    fontFamily: FONTS.ui,
    fontWeight: "600",
    sizes: {
      h1: { fontSize: rem(FONT_SIZES.xxxl), lineHeight: "1.15" },
      h2: { fontSize: rem(FONT_SIZES.xxl), lineHeight: "1.2" },
      h3: { fontSize: rem(FONT_SIZES.xl), lineHeight: "1.25" },
      h4: { fontSize: rem(FONT_SIZES.lg), lineHeight: "1.3" },
      h5: { fontSize: rem(FONT_SIZES.md), lineHeight: "1.4" },
      h6: { fontSize: rem(FONT_SIZES.sm), lineHeight: "1.4" },
    },
  },
  fontSizes: {
    xs: rem(FONT_SIZES.xs),
    sm: rem(FONT_SIZES.sm),
    md: rem(FONT_SIZES.md),
    lg: rem(FONT_SIZES.lg),
    xl: rem(FONT_SIZES.xl),
  },
  radius: { sm: rem(RADII.field), md: rem(RADII.card) },
  defaultRadius: "sm",
  spacing: { xs: space(2), sm: space(3), md: space(4), lg: space(6), xl: space(8) },
  components: {
    // Cards have a 1 px border and no shadow; shadows are for menus and dialogs only
    Card: Card.extend({
      defaultProps: { radius: "md", withBorder: true, shadow: "none" },
      classNames: { root: classes.card },
    }),
  },
});

const cssVariables = (prefix: string, values: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(values).map(([name, value]) => [`--ss-${prefix}-${toKebab(name)}`, value]),
  );
const inRem = (values: Record<string, number>) =>
  Object.fromEntries(Object.entries(values).map(([name, px]) => [name, rem(px)]));

/** Every token as a CSS variable (`--ss-color-ink`, `--font-price`, ...) for SCSS modules. */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    ...cssVariables("color", COLORS),
    ...cssVariables("font-size", inRem(FONT_SIZES)),
    ...cssVariables("radius", inRem(RADII)),
    "--ss-space-step": rem(SPACING_STEP),
    "--font-price": FONTS.price,
  },
  light: {
    "--mantine-color-dimmed": COLORS.muted,
    "--mantine-color-default-border": COLORS.line,
  },
  dark: {},
});

function toKebab(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
