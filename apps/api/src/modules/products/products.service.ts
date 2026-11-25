import type { FilterQuery, PipelineStage, Types } from "mongoose";
import {
  LIMITS,
  type CategorySlug,
  type FacetCount,
  type PriceHistoryDto,
  type ProductDetailDto,
  type ProductSort,
  type ProductsPageDto,
  type ProductsQuery,
  type StoreSlug,
} from "@storeseeker/shared";
import { PricePoint } from "../../db/models/price-point";
import { Product, type ProductFields } from "../../db/models/product";
import { priceInsight, type PriceSample } from "../../db/price-insight";
import { notFound } from "../../http/errors";
import { enabledStores } from "../stores/stores.service";
import { relevanceRank, searchTermsMatch } from "./search-filter";
import { toProductDto, type LeanProduct } from "./to-dto";

const DAY_MS = 24 * 60 * 60 * 1000;
const CENTS_PER_EURO = 100;

type Filter = FilterQuery<ProductFields>;
type SortSpec = Record<string, 1 | -1>;
type FacetRow<T> = { _id: T; count: number };

// Every sort ends with _id, so equal values keep one order and pages do not overlap
const SORTS: Record<Exclude<ProductSort, "relevance">, SortSpec> = {
  price_asc: { priceCents: 1, _id: 1 },
  price_desc: { priceCents: -1, _id: 1 },
  discount: { discountPercent: -1, priceCents: 1, _id: 1 },
};

/** Sort stages of the "relevance" order: an earlier match first, then by title. */
export function relevanceStages(q: string | undefined): PipelineStage[] {
  if (!q) return [{ $sort: { title: 1, _id: 1 } }];
  return [{ $addFields: { rank: relevanceRank(q) } }, { $sort: { rank: 1, title: 1, _id: 1 } }];
}

function sortStages(sort: ProductSort, q: string | undefined): PipelineStage[] {
  return sort === "relevance" ? relevanceStages(q) : [{ $sort: SORTS[sort] }];
}

function toFacets<T extends string>(rows: FacetRow<T>[]): FacetCount<T>[] {
  return rows.map((row) => ({ value: row._id, count: row.count }));
}

export async function searchProducts(query: ProductsQuery): Promise<ProductsPageDto> {
  const stores = await enabledStores();
  const base: Filter = { available: true, storeSlug: { $in: [...stores.keys()] } };
  if (query.q) Object.assign(base, searchTermsMatch(query.q));
  if (query.min !== undefined || query.max !== undefined) {
    base.priceCents = {
      ...(query.min !== undefined ? { $gte: query.min * CENTS_PER_EURO } : {}),
      ...(query.max !== undefined ? { $lte: query.max * CENTS_PER_EURO } : {}),
    };
  }
  if (query.discounted) base.discountPercent = { $gt: 0 };

  // A facet leaves out its own filter, so it still lists the values one can switch to
  const byStore: Filter = query.store ? { storeSlug: { $in: query.store } } : {};
  const byCategory: Filter = query.category ? { categories: { $in: query.category } } : {};
  const countDesc = { $sort: { count: -1, _id: 1 } } as const;

  const [result] = await Product.aggregate<{
    items: LeanProduct[];
    total: { count: number }[];
    stores: FacetRow<StoreSlug>[];
    categories: FacetRow<CategorySlug>[];
  }>([
    { $match: base },
    {
      $facet: {
        items: [
          { $match: { ...byStore, ...byCategory } },
          ...sortStages(query.sort, query.q),
          { $skip: (query.page - 1) * query.pageSize },
          { $limit: query.pageSize },
        ] as PipelineStage.FacetPipelineStage[],
        total: [{ $match: { ...byStore, ...byCategory } }, { $count: "count" }],
        stores: [
          { $match: byCategory },
          { $group: { _id: "$storeSlug", count: { $sum: 1 } } },
          countDesc,
        ],
        categories: [
          { $match: byStore },
          { $unwind: "$categories" },
          { $group: { _id: "$categories", count: { $sum: 1 } } },
          countDesc,
        ],
      },
    },
  ]);

  return {
    items: (result?.items ?? []).map((product) => toProductDto(product, stores)),
    total: result?.total[0]?.count ?? 0,
    page: query.page,
    pageSize: query.pageSize,
    facets: {
      stores: toFacets(result?.stores ?? []),
      categories: toFacets(result?.categories ?? []),
    },
  };
}

/** Ascending price points of each product, as priceInsight takes them. */
export async function pointsByProduct(
  productIds: Types.ObjectId[],
): Promise<Map<string, PriceSample[]>> {
  const points = await PricePoint.find({ productId: { $in: productIds } })
    .sort({ observedAt: 1 })
    .lean();
  const byProduct = new Map<string, PriceSample[]>();
  for (const point of points) {
    const key = point.productId.toHexString();
    const list = byProduct.get(key) ?? [];
    list.push({
      priceCents: point.priceCents,
      regularPriceCents: point.regularPriceCents ?? null,
      observedAt: point.observedAt,
    });
    byProduct.set(key, list);
  }
  return byProduct;
}

/** A product of a disabled store does not exist for the API. */
async function findVisibleProduct(id: string) {
  const stores = await enabledStores();
  const product = await Product.findById(id).lean<LeanProduct>();
  if (!product || !stores.has(product.storeSlug)) {
    throw notFound("Ovaj proizvod ne postoji ili više nije dostupan.");
  }
  return { product, stores };
}

// Every saved product has a first point; without one the current price stands for the history
export function samplesOf(product: LeanProduct, points: PriceSample[] | undefined): PriceSample[] {
  if (points && points.length > 0) return points;
  return [
    {
      priceCents: product.priceCents,
      regularPriceCents: product.regularPriceCents ?? null,
      observedAt: product.firstSeenAt,
    },
  ];
}

export async function productDetail(id: string, now: Date): Promise<ProductDetailDto> {
  const { product, stores } = await findVisibleProduct(id);
  const otherStores = [...stores.keys()].filter((slug) => slug !== product.storeSlug);
  const elsewhere: Filter = { available: true, storeSlug: { $in: otherStores } };

  const sameWhen: Filter[] = [{ searchText: product.searchText }];
  if (product.ean) sameWhen.push({ ean: product.ean });
  const [points, same] = await Promise.all([
    pointsByProduct([product._id]),
    Product.find({ ...elsewhere, $or: sameWhen })
      .sort({ priceCents: 1, _id: 1 })
      .lean<LeanProduct[]>(),
  ]);

  // Plan D refines this rule (brand, model, memory, colour); the first two words are a start
  const leadingWords = product.searchText.split(" ").slice(0, 2).join(" ");
  const similar = await Product.find({
    ...elsewhere,
    _id: { $nin: same.map((item) => item._id) },
    categories: { $in: product.categories },
    ...searchTermsMatch(leadingWords),
  })
    .sort({ priceCents: 1, _id: 1 })
    .limit(LIMITS.similarProductsMax)
    .lean<LeanProduct[]>();

  const insight = priceInsight(samplesOf(product, points.get(product._id.toHexString())), now);
  return {
    product: toProductDto(product, stores),
    insight: {
      lowest30dCents: insight.lowest30dCents,
      historySince: insight.historySince.toISOString(),
      inflatedDiscount: insight.inflatedDiscount,
    },
    sameProducts: same.map((item) => toProductDto(item, stores)),
    similarProducts: similar.map((item) => toProductDto(item, stores)),
  };
}

export async function priceHistory(id: string, days: number, now: Date): Promise<PriceHistoryDto> {
  const { product } = await findVisibleProduct(id);
  const start = new Date(now.getTime() - days * DAY_MS);
  // A point is kept only when the price changes, so the one before the window is its first price
  const [before, inWindow] = await Promise.all([
    PricePoint.findOne({ productId: product._id, observedAt: { $lt: start } })
      .sort({ observedAt: -1 })
      .lean(),
    PricePoint.find({ productId: product._id, observedAt: { $gte: start } })
      .sort({ observedAt: 1 })
      .lean(),
  ]);
  const points = before ? [before, ...inWindow] : inWindow;
  return {
    points: points.map((point) => ({
      priceCents: point.priceCents,
      regularPriceCents: point.regularPriceCents ?? null,
      observedAt: point.observedAt.toISOString(),
    })),
  };
}
