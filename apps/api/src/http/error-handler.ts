import type { ErrorRequestHandler, RequestHandler } from "express";
import type { ApiErrorBody } from "@storeseeker/shared";
import { AppError, notFound } from "./errors";

const INTERNAL_MESSAGE = "Nešto je pošlo po zlu. Pokušaj ponovo.";

// body-parser marks its errors with `type`; anything else is a bug and stays hidden from the client
function toAppError(err: unknown): AppError | null {
  if (err instanceof AppError) return err;
  const type = (err as { type?: unknown } | null)?.type;
  switch (type) {
    case "entity.parse.failed":
      return new AppError(400, "invalid_json", "Tijelo zahtjeva nije ispravan JSON.");
    case "entity.too.large":
      return new AppError(413, "payload_too_large", "Zahtjev je prevelik.");
    case "charset.unsupported":
    case "encoding.unsupported":
      return new AppError(415, "unsupported_media_type", "Pošalji podatke kao JSON u UTF-8.");
    default:
      return null;
  }
}

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(notFound("Ova adresa ne postoji."));
};

// Express recognizes an error handler only by its four parameters (#76)
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const appError = toAppError(err);
  if (!appError) req.log.error({ err }, "unhandled error");
  const body: ApiErrorBody = appError
    ? { error: { code: appError.code, message: appError.message, ...appError.extra } }
    : { error: { code: "internal_error", message: INTERNAL_MESSAGE } };
  res.status(appError?.status ?? 500).json(body);
};
