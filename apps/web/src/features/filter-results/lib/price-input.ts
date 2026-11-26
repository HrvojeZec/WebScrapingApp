import { LIMITS, productsQuerySchema } from "@storeseeker/shared";
import { PRICE_TEXT } from "../model/constants";

/** A price field read as whole euros (the API's unit), no bound, or the sentence why not. */
export type PriceInput = { value: number | undefined } | { error: string };

// Croatian format: a dot groups thousands, a comma would start the cents the API does not take
const WHOLE_EUROS = /^\d{1,3}(\.\d{3})*$|^\d+$/;

export function eurosFromInput(input: string | number): PriceInput {
  let euros: number;
  if (typeof input === "number") {
    euros = input;
  } else {
    const text = input.trim();
    if (text === "") return { value: undefined };
    if (!WHOLE_EUROS.test(text)) return { error: PRICE_TEXT.wholeEuros };
    euros = Number(text.replace(/\./g, ""));
  }
  if (!Number.isInteger(euros) || euros < 0) return { error: PRICE_TEXT.wholeEuros };
  if (euros > LIMITS.priceFilterMaxEuros) return { error: PRICE_TEXT.tooHigh };
  return { value: euros };
}

/** The API's own check, so the panel and the URL say the same sentence. */
export function priceRangeError(min: number | undefined, max: number | undefined) {
  const result = productsQuerySchema.safeParse({ min, max });
  return result.success ? undefined : result.error.issues[0]?.message;
}

/** What a price field holds while typing: a number, or the text NumberInput cannot read yet. */
export type PriceDraft = string | number;

export type PriceDrafts = {
  min: PriceDraft;
  max: PriceDraft;
  /** The URL's range the drafts last followed */
  shown: { min: number | undefined; max: number | undefined };
};

/**
 * The fields after the URL's range changed (back button, clear, a bound applied on blur). Only the
 * bound that changed is taken, so the other field keeps what is being typed into it.
 */
export function followUrl(
  drafts: PriceDrafts,
  min: number | undefined,
  max: number | undefined,
): PriceDrafts {
  if (drafts.shown.min === min && drafts.shown.max === max) return drafts;
  return {
    min: drafts.shown.min === min ? drafts.min : (min ?? ""),
    max: drafts.shown.max === max ? drafts.max : (max ?? ""),
    shown: { min, max },
  };
}
