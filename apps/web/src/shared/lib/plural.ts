import { formatCount } from "./format";

/** The three Croatian forms of a noun after a number: 1 proizvod, 2 proizvoda, 5 proizvoda. */
export type PluralForms = { one: string; few: string; other: string };

const rules = new Intl.PluralRules("hr");

export const PRODUCT_FORMS: PluralForms = {
  one: "proizvod",
  few: "proizvoda",
  other: "proizvoda",
};

/** The form of a noun that goes after `count`. */
export function pluralHr(count: number, forms: PluralForms): string {
  const rule = rules.select(count);
  return rule === "one" || rule === "few" ? forms[rule] : forms.other;
}

/** `42` → `42 proizvoda` */
export function countText(count: number, forms: PluralForms): string {
  return `${formatCount(count)} ${pluralHr(count, forms)}`;
}
