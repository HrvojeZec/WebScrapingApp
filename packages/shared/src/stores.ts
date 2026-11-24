import { z } from "zod";

export const STORE_SLUGS = ["mall", "bigbang"] as const;
export type StoreSlug = (typeof STORE_SLUGS)[number];
export const storeSlugSchema = z.enum(STORE_SLUGS);
