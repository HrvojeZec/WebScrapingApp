import { Checkbox } from "@mantine/core";
import { formatCount } from "@/shared/lib/format";
import type { FacetOption } from "../../lib/filters";
import classes from "./FacetCheckboxList.module.scss";

type Props<T extends string> = {
  legend: string;
  options: FacetOption<T>[];
  /** No counts yet: the first page is loading */
  pending?: boolean;
  onToggle: (value: T) => void;
};

/** A group of checkboxes, each with how many products it would show. */
export function FacetCheckboxList<T extends string>({
  legend,
  options,
  pending,
  onToggle,
}: Props<T>) {
  return (
    <fieldset className={classes.root}>
      <legend className={classes.legend}>{legend}</legend>
      {options.map((option) => (
        <Checkbox
          key={option.value}
          checked={option.checked}
          disabled={!pending && option.disabled}
          onChange={() => onToggle(option.value)}
          classNames={{ body: classes.body, labelWrapper: classes.labelWrapper }}
          label={
            <span className={classes.label}>
              <span>{option.label}</span>
              {!pending && <span className={classes.count}>{formatCount(option.count)}</span>}
            </span>
          }
        />
      ))}
    </fieldset>
  );
}
