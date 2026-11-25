import type { AugmentedRequest } from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors";

export type ApiRateLimit = { max: number; windowMs: number };

/** Answers a client over the API limit with 429 rate_limited and when it may try again. */
export function rateLimitedHandler(req: Request, _res: Response, next: NextFunction): void {
  const resetAt = (req as AugmentedRequest).rateLimit?.resetTime?.toISOString();
  next(
    new AppError(
      429,
      "rate_limited",
      "Previše zahtjeva. Pokušaj ponovo za nekoliko minuta.",
      resetAt ? { resetAt } : {},
    ),
  );
}
