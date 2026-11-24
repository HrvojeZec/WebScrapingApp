import { z } from "zod";
import { LIMITS } from "./limits.js";

// NFC first: macOS and some keyboards send "č" as "c" plus a combining caron, which \p{L} rejects
export function normalizeKeyword(raw: string): string {
  return raw.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("hr");
}

const ALLOWED_KEYWORD = /^[\p{L}\p{N} +\-./]+$/u;

export const keywordSchema = z
  .string()
  .transform(normalizeKeyword)
  .pipe(
    z
      .string()
      .min(LIMITS.keywordMinLength, `Upiši barem ${LIMITS.keywordMinLength} znaka.`)
      .max(LIMITS.keywordMaxLength, `Upiši najviše ${LIMITS.keywordMaxLength} znakova.`)
      .regex(ALLOWED_KEYWORD, "Koristi samo slova, brojke, razmak i znakove - + . /"),
  );
