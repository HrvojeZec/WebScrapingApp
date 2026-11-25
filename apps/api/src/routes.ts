import { Router } from "express";
import { createDealsRouter } from "./modules/deals/deals.routes";
import { createHealthRouter } from "./modules/health/health.routes";
import metaRoutes from "./modules/meta/meta.routes";
import { createProductsRouter } from "./modules/products/products.routes";
import { createScrapesRouter, type ScrapesDeps } from "./modules/scrapes/scrapes.routes";
import storesRoutes from "./modules/stores/stores.routes";
import suggestionsRoutes from "./modules/suggestions/suggestions.routes";

export function createApiRouter(deps: ScrapesDeps): Router {
  const router = Router();
  router.use(createHealthRouter(deps));
  router.use(metaRoutes);
  router.use(storesRoutes);
  router.use(createProductsRouter(deps));
  router.use(createDealsRouter(deps));
  router.use(suggestionsRoutes);
  router.use(createScrapesRouter(deps));
  return router;
}
