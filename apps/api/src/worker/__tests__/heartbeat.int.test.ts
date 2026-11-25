import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../test/mongo";
import { recordHeartbeat, workerStatus } from "../heartbeat";

const AT = new Date("2026-11-25T10:00:00Z");

describe("worker heartbeat", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);

  test("a worker never seen is offline", async () => {
    expect(await workerStatus(AT)).toEqual({ online: false, lastSeenAt: null });
  });

  test("a worker is online until two minutes pass without a heartbeat", async () => {
    await recordHeartbeat(AT);
    expect(await workerStatus(AT)).toEqual({ online: true, lastSeenAt: AT });
    expect(await workerStatus(new Date(AT.getTime() + 121_000))).toEqual({
      online: false,
      lastSeenAt: AT,
    });
  });
});
