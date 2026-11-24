import { Router } from "express";
import healthRoutes from "./modules/health/health.routes";
import productRouter from "./router/product/product-router";

export function createApiRouter(): Router {
  const router = Router();
  router.use(healthRoutes);
  router.use("/products", productRouter);
  return router;
}
