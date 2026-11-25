import type { ShopSlug } from "@storeseeker/shared";
import { harveyNormanAdapter } from "./harveynorman/adapter";
import type { ShopAdapter } from "./types";

export const SHOP_ADAPTERS: Record<ShopSlug, ShopAdapter> = {
  harveynorman: harveyNormanAdapter,
};
