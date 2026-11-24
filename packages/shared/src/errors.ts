export const API_ERROR_CODES = [
  "validation_error",
  "invalid_json",
  "not_found",
  "unsupported_media_type",
  "forbidden_origin",
  "payload_too_large",
  "daily_limit",
  "global_limit",
  "job_in_progress",
  "internal_error",
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/** `message` is a Croatian sentence shown to the user; `resetAt` is set for the limit errors. */
export type ApiErrorBody = { error: { code: ApiErrorCode; message: string; resetAt?: string } };
