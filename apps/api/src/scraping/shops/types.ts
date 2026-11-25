import type { CategorySlug, FetchMethod, ShopSlug } from "@storeseeker/shared";
import type { ParsedProduct } from "../types";

/** One page of a category listing; `nextPageUrl` is absolute, or null on the last page. */
export type ListingPage = { items: ParsedProduct[]; nextPageUrl: string | null };

/** What the worker needs to crawl a shop: where its categories are and how to read a page. */
export type ShopAdapter = {
  slug: ShopSlug;
  /** "https://www.harveynorman.hr", equal to the store's baseUrl */
  origin: string;
  fetchMethod: FetchMethod;
  /**
   * Absolute URLs of the first page of each listing that makes up the category (a shop can split
   * one of ours, e.g. phones and Apple phones). A category the shop does not have is left out.
   */
  categories: Partial<Record<CategorySlug, readonly string[]>>;
  /** A pure function over saved HTML, so it is tested on fixtures without the network. */
  parseListing(html: string, pageUrl: string): ListingPage;
};
