import { Router } from "express";
import { createHealthRouter } from "./modules/health/health.routes";
import metaRoutes from "./modules/meta/meta.routes";
import { createScrapesRouter, type ScrapesDeps } from "./modules/scrapes/scrapes.routes";

export function createApiRouter(deps: ScrapesDeps): Router {
  const router = Router();
  router.use(createHealthRouter(deps));
  router.use(metaRoutes);
  router.use(createScrapesRouter(deps));
  return router;
}
