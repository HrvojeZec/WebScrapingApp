import { Router } from "express";
import healthRoutes from "./modules/health/health.routes";
import metaRoutes from "./modules/meta/meta.routes";

export function createApiRouter(): Router {
  const router = Router();
  router.use(healthRoutes);
  router.use(metaRoutes);
  return router;
}
