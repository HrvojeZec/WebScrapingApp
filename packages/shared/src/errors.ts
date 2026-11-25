export const API_ERROR_CODES = [
  "validation_error",
  "invalid_json",
  "not_found",
  "unsupported_media_type",
  "forbidden_origin",
  "payload_too_large",
  "rate_limited",
  "no_shops",
  "internal_error",
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/** `message` is a Croatian sentence shown to the user; `resetAt` is set for `rate_limited`. */
export type ApiErrorBody = { error: { code: ApiErrorCode; message: string; resetAt?: string } };
