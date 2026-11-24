import { keywordSchema } from "@storeseeker/shared";

// The request body is untrusted: a non-string such as { $ne: null } would reach MongoDB queries as an operator
export function parseKeyword(value: unknown): string | null {
  const result = keywordSchema.safeParse(value);
  return result.success ? result.data : null;
}
