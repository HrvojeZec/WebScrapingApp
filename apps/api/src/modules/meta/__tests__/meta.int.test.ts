import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { createApp } from "../../../app";
import { createLogger } from "../../../http/logger";
import { seedDemo } from "../../../seed/seed-demo";
import { connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../../test/mongo";

const SEEDED_AT = new Date("2026-11-25T13:30:00.000Z");

describe("GET /api/meta", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);

  const app = createApp({ clientUrl: "http://localhost:5173", logger: createLogger("silent") });

  test("an empty database is not the demo", async () => {
    const res = await request(app).get("/api/meta");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ demo: false, seededAt: null });
  });

  test("a seeded database is the demo", async () => {
    await seedDemo(SEEDED_AT);
    const res = await request(app).get("/api/meta");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ demo: true, seededAt: SEEDED_AT.toISOString() });
  });
});
