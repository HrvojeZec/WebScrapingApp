import { Router } from "express";
import { dealsQuerySchema, type DealsDto, type DealsQuery } from "@storeseeker/shared";
import { Product } from "../../db/models/product";
import { priceInsight } from "../../db/price-insight";
import { validate } from "../../http/validate";
import { pointsByProduct, samplesOf } from "../products/products.service";
import { toProductDto, type LeanProduct } from "../products/to-dto";
import { enabledStores } from "../stores/stores.service";

// Inflated sales sink to the end, so the biggest discounts are read first and then re-ranked
const CANDIDATES_PER_DEAL = 4;

// A real sale first, then one without a verdict, then an inflated one
const VERDICT_ORDER = new Map<boolean | null, number>([
  [false, 0],
  [null, 1],
  [true, 2],
]);

export function createDealsRouter({ now }: { now: () => Date }): Router {
  const router = Router();

  router.get("/deals", validate({ query: dealsQuerySchema }), async (_req, res) => {
    const { limit } = res.locals.query as DealsQuery;
    const stores = await enabledStores();
    const candidates = await Product.find({
      available: true,
      storeSlug: { $in: [...stores.keys()] },
      discountPercent: { $gt: 0 },
    })
      .sort({ discountPercent: -1, _id: 1 })
      .limit(limit * CANDIDATES_PER_DEAL)
      .lean<LeanProduct[]>();

    const points = await pointsByProduct(candidates.map((product) => product._id));
    const time = now();
    const ranked = candidates.map((product) => ({
      product,
      inflatedDiscount: priceInsight(
        samplesOf(product, points.get(product._id.toHexString())),
        time,
      ).inflatedDiscount,
    }));
    ranked.sort(
      (a, b) =>
        VERDICT_ORDER.get(a.inflatedDiscount)! - VERDICT_ORDER.get(b.inflatedDiscount)! ||
        b.product.discountPercent - a.product.discountPercent ||
        a.product._id.toHexString().localeCompare(b.product._id.toHexString()),
    );

    const body: DealsDto = {
      items: ranked.slice(0, limit).map((deal) => ({
        product: toProductDto(deal.product, stores),
        inflatedDiscount: deal.inflatedDiscount,
      })),
    };
    res.json(body);
  });

  return router;
}
