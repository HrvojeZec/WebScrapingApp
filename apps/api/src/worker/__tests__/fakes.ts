import type { CategorySlug } from "@storeseeker/shared";
import type { FetchOutcome } from "../../scraping/http/polite-fetch";
import type { PageSource } from "../../scraping/page-source";
import type { BrowserHints, ListingPage, ShopAdapter } from "../../scraping/shops/types";
import type { ParsedProduct } from "../../scraping/types";

export const SHOP_ORIGIN = "https://shop.example";

export function product(externalId: string, priceCents = 10_000): ParsedProduct {
  return {
    externalId,
    title: `Product ${externalId}`,
    url: `${SHOP_ORIGIN}/p/${externalId}`,
    imageUrl: null,
    priceCents,
    regularPriceCents: null,
    available: true,
  };
}

/** A listing page as the fake adapter reads it: the "HTML" is this object as JSON. */
export type FakeListing = { items: ParsedProduct[]; next: string | null };
/** What the fake source answers for a URL: a page, a failed outcome, or a request that never ends. */
export type FakeAnswer = FakeListing | Exclude<FetchOutcome, { kind: "ok" }> | "hang";

/** Fields that differ between the http and the browser adapter, plus the page limit. */
export type FakeAdapterExtra =
  | { fetchMethod?: "http"; maxPages?: number }
  | { fetchMethod: "browser"; browser: BrowserHints; maxPages?: number };

export function fakeAdapter(
  categories: Partial<Record<CategorySlug, string[]>>,
  extra: FakeAdapterExtra = {},
): ShopAdapter {
  const base = {
    slug: "harveynorman" as const,
    origin: SHOP_ORIGIN,
    categories,
    maxPages: extra.maxPages,
    parseListing(html: string): ListingPage {
      const page = JSON.parse(html) as FakeListing;
      return { items: page.items, nextPageUrl: page.next };
    },
    pageUrl(listingUrl: string, page: number) {
      return `${listingUrl}?p=${page}`;
    },
  };
  return extra.fetchMethod === "browser"
    ? { ...base, fetchMethod: "browser", browser: extra.browser }
    : { ...base, fetchMethod: "http" };
}

export function fakeSource(answers: Record<string, FakeAnswer>) {
  const calls: string[] = [];
  const hints: (BrowserHints | undefined)[] = [];
  const source: PageSource = {
    get(url, signal, pageHints) {
      calls.push(url);
      hints.push(pageHints);
      const answer = answers[url];
      if (answer === undefined)
        return Promise.resolve({ kind: "error", message: `no page ${url}` });
      if (answer === "hang") {
        return new Promise<FetchOutcome>((_, reject) => {
          signal?.addEventListener("abort", () => reject(signal.reason), { once: true });
        });
      }
      if ("kind" in answer) return Promise.resolve(answer);
      return Promise.resolve({ kind: "ok", status: 200, url, html: JSON.stringify(answer) });
    },
  };
  return { source, calls, hints };
}

export function pageUrl(name: string, page = 1): string {
  return page === 1 ? `${SHOP_ORIGIN}/${name}` : `${SHOP_ORIGIN}/${name}?p=${page}`;
}
