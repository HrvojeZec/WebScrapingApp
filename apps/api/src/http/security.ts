import type { RequestHandler } from "express";
import { AppError } from "./errors";

const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// req.is() is null for a request without a body, so a bodyless DELETE still passes
export const requireJson: RequestHandler = (req, _res, next) => {
  if (BODY_METHODS.has(req.method) && req.is("application/json") === false) {
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
