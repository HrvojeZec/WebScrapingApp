import { z } from "zod";

export const CATEGORY_SLUGS = [
  "mobiteli",
  "laptopi",
  "televizori",
  "tableti",
  "slusalice",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];
export const categorySlugSchema = z.enum(CATEGORY_SLUGS);

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  mobiteli: "Mobiteli",
  laptopi: "Laptopi",
  televizori: "Televizori",
  tableti: "Tableti",
  slusalice: "Slušalice",
};
