import type { StoreFreshnessLine } from "@/entities/store/lib/freshness";
import { SEARCH_TEXT } from "../../model/constants";
import classes from "./StoreFreshness.module.scss";

/** "cijene od <vrijeme>" per store, so the user knows how old each store's prices are. */
export function StoreFreshness({ lines }: { lines: StoreFreshnessLine[] }) {
  if (lines.length === 0) return null;

  return (
    <ul className={classes.list} aria-label={SEARCH_TEXT.freshnessLabel}>
      {lines.map((line) => (
        <li key={line.storeSlug} className={classes.item}>
          <span className={classes.name}>{line.name}</span> {line.text}
        </li>
      ))}
    </ul>
  );
}
