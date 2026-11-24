import type { ApiErrorCode } from "@storeseeker/shared";

/** An error whose message is safe to show: the error handler sends it to the client as is. */
export class AppError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly extra: { resetAt?: string };

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    extra: { resetAt?: string } = {},
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export const badRequest = (message: string) => new AppError(400, "validation_error", message);
export const notFound = (message: string) => new AppError(404, "not_found", message);
