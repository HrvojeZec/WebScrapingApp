import { Router } from "express";
import mongoose from "mongoose";
import type { HealthDto } from "@storeseeker/shared";

const router = Router();

router.get("/health", (_req, res) => {
  const up = mongoose.connection.readyState === mongoose.ConnectionStates.connected;
  const body: HealthDto = { status: up ? "ok" : "degraded", db: up ? "up" : "down" };
  res.status(up ? 200 : 503).json(body);
});

export default router;
