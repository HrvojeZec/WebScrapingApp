import { Router } from "express";
import mongoose from "mongoose";
import type { HealthDto } from "@storeseeker/shared";
import { workerStatus } from "../../worker/heartbeat";

export function createHealthRouter({ now }: { now: () => Date }): Router {
  const router = Router();

  router.get("/health", async (_req, res) => {
    const up = mongoose.connection.readyState === mongoose.ConnectionStates.connected;
    // Without a connection the query would wait in mongoose's buffer, and health must answer now
    const worker = up ? await workerStatus(now()) : { online: false, lastSeenAt: null };
    const body: HealthDto = {
      status: up ? "ok" : "degraded",
      db: up ? "up" : "down",
      worker: { online: worker.online, lastSeenAt: worker.lastSeenAt?.toISOString() ?? null },
    };
    res.status(up ? 200 : 503).json(body);
  });

  return router;
}
