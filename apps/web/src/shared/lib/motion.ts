const MS_PER_SECOND = 1000;

/** The `layoutId` shared by a product's image on its card and on its page. */
export function productImageLayoutId(id: string): string {
  return `product-image-${id}`;
}

/** Mantine takes transition durations in ms, motion in seconds. */
export function secondsToMs(seconds: number): number {
  return Math.round(seconds * MS_PER_SECOND);
}

/** A motion cubic bezier as a CSS `transition-timing-function`. */
export function cssEasing(ease: readonly [number, number, number, number]): string {
  return `cubic-bezier(${ease.join(", ")})`;
}

export interface SplitNumber {
  prefix: string;
  value: number;
  suffix: string;
}

/** What hr-HR puts between thousands groups, as `format.ts` writes numbers. */
export const HR_GROUP_SEPARATOR = ".";

// The whole part of an hr-HR number: digits, with "." between thousands groups
const WHOLE_PART = /^(\D*?)(\d{1,3}(?:\.\d{3})+|\d+)(.*)$/su;

/**
 * Splits text from `format.ts` into the whole number a counter can roll and the text around it,
 * so `1.039,99 €` rolls `1.039` and keeps `,99 €`, and `−12 %` keeps its real minus sign.
 */
export function splitNumber(text: string): SplitNumber | null {
  const match = WHOLE_PART.exec(text);
  if (!match) return null;
  const [, prefix, whole, suffix] = match;
  return { prefix, value: Number(whole.split(HR_GROUP_SEPARATOR).join("")), suffix };
}
