import { Router } from "express";
import { z } from "zod";
import {
  historyQuerySchema,
  objectIdSchema,
  productsQuerySchema,
  type HistoryQuery,
  type ProductsQuery,
} from "@storeseeker/shared";
import { validate } from "../../http/validate";
import { priceHistory, productDetail, searchProducts } from "./products.service";

const idParams = z.object({ id: objectIdSchema });

export function createProductsRouter({ now }: { now: () => Date }): Router {
  const router = Router();

  router.get("/products", validate({ query: productsQuerySchema }), async (_req, res) => {
    res.json(await searchProducts(res.locals.query as ProductsQuery));
  });

  router.get("/products/:id", validate({ params: idParams }), async (_req, res) => {
    const { id } = res.locals.params as { id: string };
    res.json(await productDetail(id, now()));
  });

  router.get(
    "/products/:id/history",
    validate({ params: idParams, query: historyQuerySchema }),
    async (_req, res) => {
      const { id } = res.locals.params as { id: string };
      const { days } = res.locals.query as HistoryQuery;
      res.json(await priceHistory(id, days, now()));
    },
  );

  return router;
}
