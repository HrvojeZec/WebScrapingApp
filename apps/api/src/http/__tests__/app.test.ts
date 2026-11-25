import express, { type Express } from "express";
import { pinoHttp } from "pino-http";
import request from "supertest";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { objectIdSchema } from "@storeseeker/shared";
import { createApp } from "../../app";
import { AppError } from "../errors";
import { errorHandler, notFoundHandler } from "../error-handler";
import { createLogger } from "../logger";
import { validate } from "../validate";

const CLIENT_URL = "http://localhost:5173";
const logger = createLogger("silent");
const app = createApp({ clientUrl: CLIENT_URL, logger });

// A small app with the real error handling, for routes the API itself does not have
function appWith(register: (app: Express) => void): Express {
  const testApp = express();
  testApp.use(pinoHttp({ logger }));
  testApp.use(express.json());
  register(testApp);
  testApp.use(notFoundHandler);
  testApp.use(errorHandler);
  return testApp;
}

describe("error handling", () => {
  test("an unknown route returns a JSON 404", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "not_found", message: expect.any(String) } });
  });

  test("an unexpected async error returns a generic 500 without internals", async () => {
    const testApp = appWith((a) =>
      a.get("/boom", async () => {
        throw new Error("secret at line 1");
      }),
    );
    const res = await request(testApp).get("/boom");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { code: "internal_error", message: "Nešto je pošlo po zlu. Pokušaj ponovo." },
    });
    expect(res.text).not.toContain("secret");
    expect(res.text).not.toContain("at ");
  });

  test("an AppError keeps its status and code", async () => {
    const testApp = appWith((a) =>
      a.get("/no-shops", () => {
        throw new AppError(503, "no_shops", "x");
      }),
    );
    const res = await request(testApp).get("/no-shops");
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: { code: "no_shops", message: "x" } });
  });

  test("an AppError carries resetAt for limit errors", async () => {
    const resetAt = "2026-11-24T23:00:00.000Z";
    const testApp = appWith((a) =>
      a.get("/limit", () => {
        throw new AppError(429, "rate_limited", "Limit.", { resetAt });
      }),
    );
    const res = await request(testApp).get("/limit");
    expect(res.status).toBe(429);
    expect(res.body).toEqual({ error: { code: "rate_limited", message: "Limit.", resetAt } });
  });
});

describe("validate", () => {
  const testApp = appWith((a) => {
    a.get("/items/:id", validate({ params: z.object({ id: objectIdSchema }) }), (_req, res) => {
      res.json(res.locals.params);
    });
    a.get(
      "/search",
      validate({ query: z.object({ page: z.coerce.number().int().min(1).default(1) }) }),
      (_req, res) => {
        res.json(res.locals.query);
      },
    );
  });

  test("an invalid id returns 400 validation_error (#76)", async () => {
    const res = await request(testApp).get("/items/abc");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("validation_error");
    expect(res.body.error.message).toEqual(expect.any(String));
  });

  test("parsed values reach the handler through res.locals", async () => {
    const id = "64b7f0c2a1e4d3b2c1a0f9e8";
    expect((await request(testApp).get(`/items/${id}`)).body).toEqual({ id });
    expect((await request(testApp).get("/search?page=3")).body).toEqual({ page: 3 });
  });
});

describe("request guards", () => {
  test("malformed JSON returns 400 invalid_json", async () => {
    const res = await request(app)
      .post("/api/unknown")
      .set("Content-Type", "application/json")
      .send("{bad");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("invalid_json");
  });

  test("a body that is not JSON returns 415", async () => {
    const res = await request(app)
      .post("/api/unknown")
      .set("Content-Type", "text/plain")
      .send("hello");
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe("unsupported_media_type");
  });

  test("a JSON body over 10 kB returns 413", async () => {
    const res = await request(app)
      .post("/api/unknown")
      .send({ text: "x".repeat(11 * 1024) });
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("payload_too_large");
  });

  test("a request from a foreign origin returns 403", async () => {
    const res = await request(app).get("/api/health").set("Origin", "https://evil.example");
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("forbidden_origin");
  });

  test("a request from the web app origin passes", async () => {
    const res = await request(app).get("/api/unknown").set("Origin", CLIENT_URL);
    expect(res.status).toBe(404);
    expect(res.headers["access-control-allow-origin"]).toBe(CLIENT_URL);
  });
});

describe("security headers", () => {
  test("helmet headers are set and x-powered-by is not", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("GET /api/health", () => {
  test("reports a degraded API without a database connection", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "degraded", db: "down" });
  });
});

describe("API rate limit", () => {
  test("a client over the limit gets 429 rate_limited with resetAt", async () => {
    const limited = createApp({
      clientUrl: CLIENT_URL,
      logger,
      apiRateLimit: { max: 2, windowMs: 60_000 },
    });
    await request(limited).get("/api/health");
    await request(limited).get("/api/health");
    const res = await request(limited).get("/api/health");
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      error: { code: "rate_limited", message: expect.any(String), resetAt: expect.any(String) },
    });
    expect(Date.parse(res.body.error.resetAt)).toBeGreaterThan(Date.now());
  });

  test("routes outside /api are not counted", async () => {
    const limited = createApp({
      clientUrl: CLIENT_URL,
      logger,
      apiRateLimit: { max: 1, windowMs: 60_000 },
    });
    await request(limited).get("/unknown");
    await request(limited).get("/unknown");
    expect((await request(limited).get("/api/health")).status).toBe(503);
  });
});
