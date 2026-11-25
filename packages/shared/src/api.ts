import { z } from "zod";
import { CATEGORY_SLUGS, categorySlugSchema, type CategorySlug } from "./categories.js";
import { LIMITS } from "./limits.js";
import {
  PRODUCT_SORTS,
  type CrawlStatus,
  type JobKind,
  type JobSource,
  type JobStatus,
  type StoreJobStatus,
} from "./statuses.js";
import { searchTermSchema } from "./search.js";
import { storeSlugSchema } from "./stores.js";
import type { StoreSlug } from "./stores.js";

export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, "Neispravan ID.");

/** Body of POST /api/scrapes. No body, or no categories, means every category. */
export const createScrapeBodySchema = z
  .object({
    categories: z
      .array(categorySlugSchema)
      .min(1, "Odaberi barem jednu kategoriju.")
      .max(CATEGORY_SLUGS.length)
      .refine(
        (categories) => new Set(categories).size === categories.length,
        "Svaku kategoriju navedi samo jednom.",
      )
      .optional(),
  })
  .optional();
export type CreateScrapeBody = z.infer<typeof createScrapeBodySchema>;

export type StoreJobDto = {
  storeSlug: StoreSlug;
  status: StoreJobStatus;
  pages: number;
  products: number;
  error: string | null;
};

/** queuePosition: jobs that run before this one, null once it is no longer queued. */
export type ScrapeJobDto = {
  id: string;
  kind: JobKind;
  source: JobSource;
  status: JobStatus;
  categories: CategorySlug[];
  perStore: StoreJobDto[];
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  queuePosition: number | null;
  workerOnline: boolean;
};

/** fresh: every asked category was crawled recently, so no job was queued. */
export type CreateScrapeResponse =
  { fresh: true; lastCrawledAt: string } | { fresh: false; job: ScrapeJobDto };

/** A comma list, a repeated parameter (?store=a&store=b) or both; repeated values count once. */
function slugListSchema<T extends string>(slug: z.ZodType<T, string>) {
  return z
    .union([z.string(), z.array(z.string())])
    .transform((value) =>
      (Array.isArray(value) ? value : [value]).flatMap((part) =>
        part.split(",").map((item) => item.trim()),
      ),
    )
    .pipe(z.array(slug))
    .transform((slugs) => [...new Set(slugs)]);
}

const priceEurosSchema = z.coerce.number().int().min(0).max(LIMITS.priceFilterMaxEuros);

export const productsQuerySchema = z
  .object({
    q: searchTermSchema.optional(),
    category: slugListSchema(categorySlugSchema).optional(),
    store: slugListSchema(storeSlugSchema).optional(),
    min: priceEurosSchema.optional(),
    max: priceEurosSchema.optional(),
    // Only "true" and "false": zod's default would also read "yes", "on" and "1"
    discounted: z.stringbool({ truthy: ["true"], falsy: ["false"] }).default(false),
    sort: z.enum(PRODUCT_SORTS).default("relevance"),
    page: z.coerce.number().int().min(1).max(LIMITS.pageMax).default(1),
    pageSize: z.coerce
      .number()
      .int()
      .min(1)
      .max(LIMITS.pageSizeMax)
      .default(LIMITS.pageSizeDefault),
  })
  .refine((query) => query.min === undefined || query.max === undefined || query.min <= query.max, {
    message: "Najniža cijena ne može biti veća od najviše.",
    path: ["min"],
  });
export type ProductsQuery = z.infer<typeof productsQuerySchema>;

export const historyQuerySchema = z.object({
  days: z.coerce
    .number()
    .int()
    .min(1)
    .max(LIMITS.historyDaysMax)
    .default(LIMITS.historyDaysDefault),
});
export type HistoryQuery = z.infer<typeof historyQuerySchema>;

export const dealsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(LIMITS.dealsMax).default(LIMITS.dealsDefault),
});
export type DealsQuery = z.infer<typeof dealsQuerySchema>;

export const suggestionsQuerySchema = z.object({ q: searchTermSchema });
export type SuggestionsQuery = z.infer<typeof suggestionsQuerySchema>;

/** lastCrawledAt: the last ok or partial crawl; lastRunStatus: the last crawl of any outcome. */
export type StoreDto = {
  slug: StoreSlug;
  name: string;
  baseUrl: string;
  lastCrawledAt: string | null;
  lastRunStatus: CrawlStatus | null;
};

export type ProductDto = {
  id: string;
  storeSlug: StoreSlug;
  storeName: string;
  title: string;
  url: string;
  imageUrl: string | null;
  priceCents: number;
  regularPriceCents: number | null;
  discountPercent: number;
  currency: "EUR";
  available: boolean;
  categories: CategorySlug[];
  lastSeenAt: string;
};

export type FacetCount<T extends string> = { value: T; count: number };

/** Each facet counts with every filter but its own, so picking a store keeps the other stores. */
export type ProductsPageDto = {
  items: ProductDto[];
  total: number;
  page: number;
  pageSize: number;
  facets: { stores: FacetCount<StoreSlug>[]; categories: FacetCount<CategorySlug>[] };
};

/** inflatedDiscount: null when the price is not a sale, or there is no price from before it. */
export type PriceInsightDto = {
  lowest30dCents: number;
  historySince: string;
  inflatedDiscount: boolean | null;
};

export type ProductDetailDto = {
  product: ProductDto;
  insight: PriceInsightDto;
  sameProducts: ProductDto[];
  similarProducts: ProductDto[];
};

export type PricePointDto = {
  priceCents: number;
  regularPriceCents: number | null;
  observedAt: string;
};

/** Ascending; the first point may be older than the window: the price valid at its start. */
export type PriceHistoryDto = { points: PricePointDto[] };

export type DealDto = { product: ProductDto; inflatedDiscount: boolean | null };
export type DealsDto = { items: DealDto[] };

export type SuggestionsDto = { suggestions: string[] };

/** demo: the database was filled by the seed with made-up stores, so the web shows a notice. */
export type MetaDto = { demo: boolean; seededAt: string | null };

export type HealthDto = {
  status: "ok" | "degraded";
  db: "up" | "down";
  worker: { online: boolean; lastSeenAt: string | null };
};
