import { useState, type FocusEvent, type KeyboardEvent } from "react";
import { NumberInput } from "@mantine/core";
import {
  eurosFromInput,
  followUrl,
  priceRangeError,
  type PriceDrafts,
} from "../../lib/price-input";
import { FILTER_TEXT, PRICE_INPUT, PRICE_TEXT } from "../../model/constants";
import classes from "./PriceRangeInput.module.scss";

type Props = {
  min: number | undefined;
  max: number | undefined;
  /** The URL's own complaint about the range, e.g. a hand-edited min > max */
  issue?: string;
  onChange: (min: number | undefined, max: number | undefined) => void;
};

/**
 * From and to in whole euros, applied when the focus leaves both fields or on Enter. A wrong range
 * stays in the fields with its sentence and is never sent to the API.
 */
export function PriceRangeInput({ min, max, issue, onChange }: Props) {
  const [drafts, setDrafts] = useState<PriceDrafts>({
    min: min ?? "",
    max: max ?? "",
    shown: { min, max },
  });
  const [errors, setErrors] = useState<{ min?: string; max?: string }>({});

  // The fields follow the URL during render, not by a remount, so the focus stays where it is
  const followed = followUrl(drafts, min, max);
  if (followed !== drafts) {
    setDrafts(followed);
    setErrors({});
  }

  const apply = () => {
    const from = eurosFromInput(drafts.min);
    const to = eurosFromInput(drafts.max);
    if ("error" in from || "error" in to) {
      setErrors({
        min: "error" in from ? from.error : undefined,
        max: "error" in to ? to.error : undefined,
      });
      return;
    }
    const range = priceRangeError(from.value, to.value);
    if (range) {
      setErrors({ min: range });
      return;
    }
    setErrors({});
    if (from.value !== min || to.value !== max) onChange(from.value, to.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") apply();
  };

  // Going from "Od" to "Do" is still typing the range: one request when the range is done
  const onBlur = (event: FocusEvent<HTMLFieldSetElement>) => {
    const next = event.relatedTarget;
    if (!(next instanceof Node && event.currentTarget.contains(next))) apply();
  };

  const field = {
    // Cents are typed and refused with a sentence; a swallowed comma would make 10,5 into 105
    allowDecimal: true,
    allowNegative: false,
    thousandSeparator: PRICE_INPUT.thousandSeparator,
    decimalSeparator: PRICE_INPUT.decimalSeparator,
    clampBehavior: "none",
    hideControls: true,
    inputMode: "numeric",
    rightSection: PRICE_TEXT.currency,
    onKeyDown,
  } as const;

  return (
    <fieldset className={classes.root} onBlur={onBlur}>
      <legend className={classes.legend}>{FILTER_TEXT.price}</legend>
      <div className={classes.fields}>
        <NumberInput
          {...field}
          label={PRICE_TEXT.min}
          value={drafts.min}
          onChange={(value) => setDrafts((current) => ({ ...current, min: value }))}
          error={errors.min ?? issue}
        />
        <NumberInput
          {...field}
          label={PRICE_TEXT.max}
          value={drafts.max}
          onChange={(value) => setDrafts((current) => ({ ...current, max: value }))}
          error={errors.max}
        />
      </div>
    </fieldset>
  );
}
