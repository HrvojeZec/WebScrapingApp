import { z } from "zod";

/** Real shops, each with a scraper adapter. */
export const SHOP_SLUGS = ["harveynorman"] as const;
export type ShopSlug = (typeof SHOP_SLUGS)[number];
export const shopSlugSchema = z.enum(SHOP_SLUGS);

/** Made-up stores of the demo seed; no scraper ever runs for them. */
export const DEMO_STORE_SLUGS = ["demo-a", "demo-b", "demo-c"] as const;
export type DemoStoreSlug = (typeof DEMO_STORE_SLUGS)[number];

export const STORE_SLUGS = [...SHOP_SLUGS, ...DEMO_STORE_SLUGS] as const;
export type StoreSlug = (typeof STORE_SLUGS)[number];
export const storeSlugSchema = z.enum(STORE_SLUGS);
