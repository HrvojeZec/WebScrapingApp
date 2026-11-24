import { Router } from "express";
import healthRoutes from "./modules/health/health.routes";

export function createApiRouter(): Router {
  const router = Router();
  router.use(healthRoutes);
  return router;
}
