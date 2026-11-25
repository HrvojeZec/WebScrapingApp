import type { StoreDto, StoreSlug } from "@storeseeker/shared";
import { formatDateTime } from "@/shared/lib/format";

export type StoreFreshnessLine = { storeSlug: StoreSlug; name: string; text: string };

/** How old each store's prices are, as the results page writes it. */
export function storeFreshness(stores: StoreDto[]): StoreFreshnessLine[] {
  return stores.map((store) => ({
    storeSlug: store.slug,
    name: store.name,
    text: store.lastCrawledAt
      ? `cijene od ${formatDateTime(store.lastCrawledAt)}`
      : "još nije osvježeno",
  }));
}
