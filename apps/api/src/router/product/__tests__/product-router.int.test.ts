import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { createApp } from "../../../app";
import { createLogger } from "../../../http/logger";
import { connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../../test/mongo";

const app = createApp({ clientUrl: "http://localhost:5173", logger: createLogger("silent") });

beforeAll(connectMemoryMongoDB);
afterAll(disconnectMemoryMongoDB);

// Before #76 these returned Express's HTML error page, with a stack trace outside production
describe("legacy product routes return JSON errors", () => {
  test("a keyword without products returns a JSON 404", async () => {
    const res = await request(app).get("/api/products/keyword?keyword=nothing");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual({ error: { code: "not_found", message: expect.any(String) } });
  });

  test("a missing keyword returns a JSON 400", async () => {
    const res = await request(app).get("/api/products/keyword");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("validation_error");
  });
});
