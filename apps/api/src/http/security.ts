import type { RequestHandler } from "express";
import { AppError } from "./errors";

const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// fetch() without a body sends Content-Length: 0 and no Content-Type; type-is counts that as a
// body, so it is let through here. A form always sends a Content-Type, so it still gets 415.
const isEmptyUntyped = (req: Parameters<RequestHandler>[0]) =>
  req.headers["content-type"] === undefined &&
  req.headers["transfer-encoding"] === undefined &&
  (req.headers["content-length"] ?? "0") === "0";

export const requireJson: RequestHandler = (req, _res, next) => {
  if (BODY_METHODS.has(req.method) && !isEmptyUntyped(req) && !req.is("application/json")) {
    return next(new AppError(415, "unsupported_media_type", "Pošalji podatke kao JSON."));
  }
  next();
};

// CORS only stops browsers from reading the response; this also stops the request from running
export function checkOrigin(clientUrl: string): RequestHandler {
  return (req, _res, next) => {
    const origin = req.headers.origin;
    if (origin !== undefined && origin !== clientUrl) {
      return next(new AppError(403, "forbidden_origin", "Zahtjev s ove adrese nije dopušten."));
    }
    next();
  };
}
