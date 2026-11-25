import classes from "./StoreBadge.module.scss";

/** The store as plain text: the app shows no store logos. */
export function StoreBadge({ name }: { name: string }) {
  return <span className={classes.badge}>{name}</span>;
}
