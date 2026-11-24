import type { RequestHandler } from "express";
import { z, type ZodType } from "zod";
import { badRequest } from "./errors";

// Schemas without their own message fall back to Croatian instead of zod's English defaults
z.config(z.locales.hr());

type Schemas = { query?: ZodType; body?: ZodType; params?: ZodType };

/** Parsed values go to res.locals, because req.query is a read-only getter in Express 5. */
export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    for (const key of ["params", "query", "body"] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (!result.success) {
        return next(badRequest(result.error.issues[0]?.message ?? "Neispravan zahtjev."));
      }
      res.locals[key] = result.data;
    }
    next();
  };
}
