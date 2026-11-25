import type { FormEvent } from "react";
import { Autocomplete, Button, type AutocompleteProps } from "@mantine/core";
import { IconSearch, IconTrash } from "@tabler/icons-react";
import { useSearchBox } from "../../hooks/useSearchBox";
import { CLEAR_RECENT_OPTION, SEARCH_BOX_TEXT } from "../../model/constants";
import classes from "./SearchBox.module.scss";

type Props = {
  /** `header`: compact, label for screen readers only; `hero`: large, on the home page */
  size: "header" | "hero";
};

// API suggestions already match without diacritics, so Mantine's own filter would hide some
const showAll: AutocompleteProps["filter"] = ({ options }) => options;

const renderOption: AutocompleteProps["renderOption"] = ({ option }) =>
  option.value === CLEAR_RECENT_OPTION ? (
    <span className={classes.clear}>
      <IconTrash aria-hidden className={classes.clearIcon} />
      {SEARCH_BOX_TEXT.clearRecent}
    </span>
  ) : (
    option.value
  );

export function SearchBox({ size }: Props) {
  const { value, setValue, error, options, submit, pickOption } = useSearchBox();
  const hero = size === "hero";

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <form role="search" className={`${classes.root} ${classes[size]}`} onSubmit={onSubmit}>
      <Autocomplete
        className={classes.field}
        classNames={{ label: hero ? undefined : classes.visuallyHidden }}
        label={SEARCH_BOX_TEXT.label}
        placeholder={SEARCH_BOX_TEXT.placeholder}
        leftSection={<IconSearch aria-hidden className={classes.icon} />}
        size={hero ? "lg" : "md"}
        value={value}
        onChange={setValue}
        onOptionSubmit={pickOption}
        data={options}
        filter={showAll}
        renderOption={renderOption}
        error={error}
        autoComplete="off"
        enterKeyHint="search"
      />
      <Button type="submit" size={hero ? "lg" : "md"} className={classes.submit}>
        {SEARCH_BOX_TEXT.submit}
      </Button>
    </form>
  );
}
