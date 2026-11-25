// Every number and date the UI shows goes through these, in Croatian and in Zagreb time.
import { LIMITS } from "@storeseeker/shared";

const LOCALE = "hr-HR";
const CENTS_PER_EURO = 100;
const PERCENT = 100;

const priceFormat = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "EUR" });
const discountFormat = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  signDisplay: "always",
  maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: LIMITS.limitTimeZone,
});
const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: LIMITS.limitTimeZone,
});

/** `103999` → `1.039,99 €` */
export function formatPrice(cents: number): string {
  return priceFormat.format(cents / CENTS_PER_EURO);
}

// ICU pads hr-HR days and months to two digits ("01. 07."), Croatian orthography writes "1. 7."
function zagrebDate(date: Date): string {
  const parts = dateFormat.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((candidate) => candidate.type === type)?.value);
  return `${part("day")}. ${part("month")}. ${part("year")}.`;
}

/** `2026-11-24T10:42:00Z` → `24. 11. 2026.` */
export function formatDate(value: string | Date): string {
  return zagrebDate(new Date(value));
}

/** `2026-11-24T10:42:00Z` → `24. 11. 2026. u 11:42` */
export function formatDateTime(value: string | Date): string {
  const date = new Date(value);
  return `${zagrebDate(date)} u ${timeFormat.format(date)}`;
}

/** A discount of `12` percent → `−12 %` */
export function formatDiscount(percent: number): string {
  return discountFormat.format(-Math.abs(percent) / PERCENT);
}
