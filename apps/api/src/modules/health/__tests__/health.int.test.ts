import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { createApp } from "../../../app";
import { createLogger } from "../../../http/logger";
import { connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../../test/mongo";

describe("GET /api/health with a database", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);

  test("reports ok when MongoDB is connected", async () => {
    const app = createApp({ clientUrl: "http://localhost:5173", logger: createLogger("silent") });
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", db: "up" });
  });
});
