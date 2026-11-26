import type { CategorySlug, ShopSlug } from "@storeseeker/shared";
import type { ParsedProduct } from "../types";

/** One page of a category listing; `nextPageUrl` is absolute, or null on the last page. */
export type ListingPage = { items: ParsedProduct[]; nextPageUrl: string | null };

/** What the browser waits for on a listing page, and which other hosts it may load from. */
export type BrowserHints = {
  /** One product card; the page is read once this many cards stop changing */
  waitForSelector: string;
  /** Hosts besides the page's own that the prices need; every other host is blocked */
  extraHosts?: readonly string[];
};

type ShopAdapterBase = {
  slug: ShopSlug;
  /** "https://www.harveynorman.hr", equal to the store's baseUrl */
  origin: string;
  /**
   * Absolute URLs of the first page of each listing that makes up the category (a shop can split
   * one of ours, e.g. phones and Apple phones). A category the shop does not have is left out.
   */
  categories: Partial<Record<CategorySlug, readonly string[]>>;
  /** A pure function over saved HTML, so it is tested on fixtures without the network. */
  parseListing(html: string, pageUrl: string): ListingPage;
  /** URL of page `page` (from 2) of a listing; live-check uses it, the crawl follows nextPageUrl. */
  pageUrl(listingUrl: string, page: number): string;
  /** Pages read per listing; LIMITS.pagesPerCategory without it (1 for a shop without page URLs). */
  maxPages?: number;
};

/** What the worker needs to crawl a shop: where its categories are and how to read a page. */
export type ShopAdapter = ShopAdapterBase &
  ({ fetchMethod: "http" } | { fetchMethod: "browser"; browser: BrowserHints });
