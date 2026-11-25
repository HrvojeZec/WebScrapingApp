import { z } from "zod";
import { CATEGORY_SLUGS, categorySlugSchema, type CategorySlug } from "./categories.js";
import { LIMITS } from "./limits.js";
import {
  PRODUCT_SORTS,
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

const storeListSchema = z
  .string()
  .transform((value) => value.split(",").map((slug) => slug.trim()))
  .pipe(z.array(storeSlugSchema))
  .transform((slugs) => [...new Set(slugs)]);

export const productsQuerySchema = z.object({
  q: searchTermSchema.optional(),
  store: storeListSchema.optional(),
  sort: z.enum(PRODUCT_SORTS).default("relevance"),
  page: z.coerce.number().int().min(1).max(100).default(1),
  pageSize: z.coerce.number().int().min(1).max(LIMITS.pageSizeMax).default(LIMITS.pageSizeDefault),
});
export type ProductsQuery = z.infer<typeof productsQuerySchema>;

export const dealsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(LIMITS.dealsMax).default(12),
});
export type DealsQuery = z.infer<typeof dealsQuerySchema>;

export type StoreDto = { slug: StoreSlug; name: string; baseUrl: string };

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
  lastSeenAt: string;
};

export type PricePointDto = {
  priceCents: number;
  regularPriceCents: number | null;
  observedAt: string;
};

export type ProductDetailDto = {
  product: ProductDto;
  history: PricePointDto[];
  lowest30dCents: number | null;
  sameProducts: ProductDto[];
  similarProducts: ProductDto[];
};

export type ProductsPageDto = {
  items: ProductDto[];
  total: number;
  page: number;
  pageSize: number;
  q: string | null;
  lastScrapedAt: string | null;
};

export type DealDto = {
  product: ProductDto;
  kind: "drop" | "sale";
  previousPriceCents: number | null;
  dropPercent: number;
};

/** demo: the database was filled by the seed with made-up stores, so the web shows a notice. */
export type MetaDto = { demo: boolean; seededAt: string | null };

export type HealthDto = {
  status: "ok" | "degraded";
  db: "up" | "down";
  worker: { online: boolean; lastSeenAt: string | null };
};
