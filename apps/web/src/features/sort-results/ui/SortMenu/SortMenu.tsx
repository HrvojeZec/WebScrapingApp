import { Select } from "@mantine/core";
import { PRODUCT_SORTS, type ProductSort } from "@storeseeker/shared";
import { PRODUCT_SORT_LABELS } from "@/entities/product/model/constants";
import { SORT_TEXT } from "../../model/constants";
import classes from "./SortMenu.module.scss";

type Props = {
  value: ProductSort;
  onChange: (sort: ProductSort) => void;
};

const OPTIONS = PRODUCT_SORTS.map((sort) => ({ value: sort, label: PRODUCT_SORT_LABELS[sort] }));

/** A labelled menu that sorts the whole result on the server, not just the page (finding R3). */
export function SortMenu({ value, onChange }: Props) {
  return (
    <Select
      className={classes.root}
      label={SORT_TEXT.label}
      data={OPTIONS}
      value={value}
      onChange={(next) => {
        const sort = PRODUCT_SORTS.find((candidate) => candidate === next);
        if (sort) onChange(sort);
      }}
      allowDeselect={false}
      checkIconPosition="right"
    />
  );
}
