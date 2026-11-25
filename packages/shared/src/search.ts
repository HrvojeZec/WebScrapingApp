import { z } from "zod";
import { LIMITS } from "./limits.js";

// NFC first: macOS and some keyboards send "č" as "c" plus a combining caron, which \p{L} rejects
export function normalizeSearchTerm(raw: string): string {
  return raw.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("hr");
}

/** Text to match search terms against, so "slusalice" finds "Slušalice". */
export function toSearchText(raw: string): string {
  return (
    raw
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      // NFD has no decomposition for đ, so it would keep its stroke
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLocaleLowerCase("hr")
      .replace(/\s+/g, " ")
      .trim()
  );
}

const ALLOWED_SEARCH_TERM = /^[\p{L}\p{N} +\-./]+$/u;

export const searchTermSchema = z
  .string()
  .transform(normalizeSearchTerm)
  .pipe(
    z
      .string()
      .min(LIMITS.searchTermMinLength, `Upiši barem ${LIMITS.searchTermMinLength} znaka.`)
      .max(LIMITS.searchTermMaxLength, `Upiši najviše ${LIMITS.searchTermMaxLength} znakova.`)
      .regex(ALLOWED_SEARCH_TERM, "Koristi samo slova, brojke, razmak i znakove - + . /"),
  );
