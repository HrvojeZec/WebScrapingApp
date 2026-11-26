import type { CategorySlug, CrawlStatus } from "@storeseeker/shared";
import type { PageSource } from "../scraping/page-source";
import type { ShopAdapter } from "../scraping/shops/types";
import type { ParsedProduct } from "../scraping/types";

export type CategoryCrawl = {
  status: CrawlStatus;
  /** True only when every listing of the category reached its last page. */
  complete: boolean;
  pages: number;
  products: ParsedProduct[];
  error: string | null;
};

type ListingCrawl = { status: CrawlStatus; pages: number; error: string | null };
type CrawlDeps = { source: PageSource; maxPages: number; signal: AbortSignal };

function sameOrigin(url: string, origin: string): boolean {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
}

async function crawlListing(
  { source, maxPages, signal }: CrawlDeps,
  adapter: ShopAdapter,
  firstPageUrl: string,
  collect: (items: ParsedProduct[]) => void,
): Promise<ListingCrawl> {
  const visited = new Set<string>();
  const hints = adapter.fetchMethod === "browser" ? adapter.browser : undefined;
  const pageLimit = Math.min(maxPages, adapter.maxPages ?? maxPages);
  let url = firstPageUrl;
  let pages = 0;

  for (;;) {
    if (pages >= pageLimit) return { status: "partial", pages, error: "page limit" };
    visited.add(url);
    const outcome = await source.get(url, signal, hints);
    if (outcome.kind !== "ok") {
      const message =
        outcome.kind === "blocked"
          ? `blocked: ${outcome.reason} (${outcome.status})`
          : outcome.message;
      if (pages === 0)
        return { status: outcome.kind === "blocked" ? "blocked" : "error", pages, error: message };
      return { status: "partial", pages, error: `page ${pages + 1}: ${message}` };
    }

    pages += 1;
    const page = adapter.parseListing(outcome.html, outcome.url);
    // A first page with nothing on it means a changed layout, not an empty category
    if (page.items.length === 0) {
      if (pages === 1) return { status: "error", pages, error: "no products parsed" };
      return { status: "partial", pages, error: `page ${pages}: no products parsed` };
    }
    collect(page.items);

    const next = page.nextPageUrl;
    if (next === null || visited.has(next)) return { status: "ok", pages, error: null };
    if (!sameOrigin(next, adapter.origin))
      return { status: "partial", pages, error: "next page off-site" };
    url = next;
  }
}

/** Reads every listing of one category of one shop. Rejects only when `signal` aborts. */
export async function crawlCategory(
  deps: CrawlDeps,
  adapter: ShopAdapter,
  category: CategorySlug,
): Promise<CategoryCrawl> {
  const products: ParsedProduct[] = [];
  const seen = new Set<string>();
  const collect = (items: ParsedProduct[]) => {
    // The shop can move a product between two pages while we read them
    for (const item of items) {
      if (seen.has(item.externalId)) continue;
      seen.add(item.externalId);
      products.push(item);
    }
  };

  const listings: ListingCrawl[] = [];
  for (const firstPageUrl of adapter.categories[category] ?? []) {
    const listing = await crawlListing(deps, adapter, firstPageUrl, collect);
    listings.push(listing);
    // A shop that blocks one page will block the next one too
    if (listing.status === "blocked") break;
  }

  const pages = listings.reduce((total, listing) => total + listing.pages, 0);
  const error = listings.find((listing) => listing.error !== null)?.error ?? null;
  let status: CrawlStatus;
  if (listings.length > 0 && listings.every((listing) => listing.status === "ok")) status = "ok";
  else if (products.length > 0) status = "partial";
  else if (listings.some((listing) => listing.status === "blocked")) status = "blocked";
  else status = "error";

  return {
    status,
    complete: status === "ok",
    pages,
    products,
    error: error ?? (status === "ok" ? null : "no listings"),
  };
}
