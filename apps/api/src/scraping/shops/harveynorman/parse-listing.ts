import * as cheerio from "cheerio";
import { parsePriceCents } from "../../parse/price";
import type { ParsedProduct } from "../../types";
import type { ListingPage } from "../types";

const PRODUCT_ID = /^product-item-info_(\d+)$/;
const LISTING_CARD = ".products.wrapper .product-item";

function absolute(href: string | undefined, pageUrl: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, pageUrl).href;
  } catch {
    return null;
  }
}

type PriceWrapper = { length: number; attr(name: string): string | undefined; text(): string };

// Magento puts the amount in data-price-amount ("169.98"); the visible text is the fallback
function priceOf(wrapper: PriceWrapper): number | null {
  if (wrapper.length === 0) return null;
  const amount = Number(wrapper.attr("data-price-amount"));
  if (Number.isFinite(amount) && amount > 0) return Math.round(amount * 100);
  return parsePriceCents(wrapper.text());
}

/** One page of a Harvey Norman category. The listing shows only products that can be bought. */
export function parseListing(html: string, pageUrl: string): ListingPage {
  const $ = cheerio.load(html);
  const items: ParsedProduct[] = [];
  const seen = new Set<string>();

  // Only the listing itself: Magento can show other product cards (recently viewed, compare)
  $(LISTING_CARD).each((_, element) => {
    const card = $(element);
    const externalId = PRODUCT_ID.exec(
      card.find(".product-item-info").first().attr("id") ?? "",
    )?.[1];
    const link = card.find("a.product-item-link").first();
    const title = link.text().replace(/\s+/g, " ").trim();
    const url = absolute(link.attr("href"), pageUrl);
    const priceCents = priceOf(card.find('[data-price-type="finalPrice"]').first());
    // A card the layout changed under is skipped, so one odd card does not lose the whole page
    if (!externalId || !title || !url || priceCents === null || seen.has(externalId)) return;
    seen.add(externalId);

    const oldPriceCents = priceOf(card.find('[data-price-type="oldPrice"]').first());
    items.push({
      externalId,
      title,
      url,
      imageUrl: absolute(card.find("img.product-image-photo").first().attr("src"), pageUrl),
      priceCents,
      regularPriceCents:
        oldPriceCents !== null && oldPriceCents > priceCents ? oldPriceCents : null,
      available: true,
    });
  });

  return { items, nextPageUrl: absolute($(".pages-item-next a").first().attr("href"), pageUrl) };
}
