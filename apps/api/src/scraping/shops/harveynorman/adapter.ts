import type { ShopAdapter } from "../types";
import { parseListing } from "./parse-listing";

const ORIGIN = "https://www.harveynorman.hr";

// Plain HTML (Magento), so no browser is needed. robots.txt allows these paths and ?p=
export const harveyNormanAdapter: ShopAdapter = {
  slug: "harveynorman",
  origin: ORIGIN,
  fetchMethod: "http",
  categories: {
    // Not /mobiteli/smartphone: it also lists cases and chargers. iPhones have their own listing
    mobiteli: [
      `${ORIGIN}/mobiteli/smartphone/mobiteli`,
      `${ORIGIN}/mobiteli/apple-smartphone/mobiteli`,
    ],
    laptopi: [`${ORIGIN}/informatika/laptopi`],
    televizori: [`${ORIGIN}/televizori-i-audio/televizori`],
    tableti: [`${ORIGIN}/informatika/tableti-i-e-citaci/tableti`],
    slusalice: [`${ORIGIN}/mobiteli/slusalice`],
  },
  parseListing,
  pageUrl(listingUrl, page) {
    const url = new URL(listingUrl);
    url.searchParams.set("p", String(page));
    return url.href;
  },
};
