import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { createApp } from "../../../app";
import { createLogger } from "../../../http/logger";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../../test/mongo";
import { recordHeartbeat } from "../../../worker/heartbeat";

const NOW = new Date("2026-11-25T10:00:00Z");
const app = createApp({
  clientUrl: "http://localhost:5173",
  logger: createLogger("silent"),
  now: () => NOW,
});

describe("GET /api/health with a database", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);
  beforeEach(clearDatabase);

  test("reports ok and an offline worker that never checked in", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      db: "up",
      worker: { online: false, lastSeenAt: null },
    });
  });

  test("reports the worker online after a recent heartbeat", async () => {
    const seen = new Date(NOW.getTime() - 60_000);
    await recordHeartbeat(seen);
    const res = await request(app).get("/api/health");
    expect(res.body.worker).toEqual({ online: true, lastSeenAt: seen.toISOString() });
  });

  test("reports the worker offline when its last heartbeat is old", async () => {
    const seen = new Date(NOW.getTime() - 10 * 60_000);
    await recordHeartbeat(seen);
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.worker).toEqual({ online: false, lastSeenAt: seen.toISOString() });
  });
});
