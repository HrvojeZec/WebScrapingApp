// The request body is untrusted: a non-string such as { $ne: null } would reach MongoDB queries as an operator
export function parseKeyword(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const keyword = value.trim();
  return keyword.length > 0 ? keyword : null;
}
