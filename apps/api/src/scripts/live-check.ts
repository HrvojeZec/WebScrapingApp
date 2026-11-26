import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { categorySlugSchema, shopSlugSchema, type ShopSlug } from "@storeseeker/shared";
import { fixtureName } from "../scraping/fixtures/fixture-name";
import { trimHtml } from "../scraping/fixtures/trim";
import { createBrowserSource } from "../scraping/browser/browser-source";
import { launchPuppeteer } from "../scraping/browser/puppeteer-port";
import { createPoliteFetch, type FetchOutcome } from "../scraping/http/polite-fetch";
import { botUserAgent } from "../scraping/http/user-agent";
import { SHOP_ADAPTERS } from "../scraping/shops/registry";

// One real page load (plus robots.txt) of one listing, run by hand, never from tests or CI. A
// browser shop opens headless Chrome, which is closed again before the script ends
const USAGE =
  "Usage: npm run scrape:live-check -w @storeseeker/api -- <shop> <category> [--list=N] [--page=N] [--save[=name]]";

// Page parts the parser never reads; without them a fixture is about 80 kB instead of 400 kB
const FIXTURE_DROP: Record<ShopSlug, string[]> = {
  harveynorman: ["header", ".nav-sections", ".sidebar", "footer"],
};

function fixtureHtml(html: string, shop: ShopSlug): string {
  const $ = cheerio.load(html);
  for (const selector of FIXTURE_DROP[shop]) $(selector).remove();
  return trimHtml($.html());
}

function flagValue(flags: string[], name: string): string | true | undefined {
  const flag = flags.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`));
  if (!flag) return undefined;
  return flag.includes("=") ? flag.slice(flag.indexOf("=") + 1) : true;
}

// A missing flag means 1; anything but a whole number from 1 up is a usage error
function positiveInt(value: string | true | undefined): number | null {
  if (value === undefined) return 1;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 ? number : null;
}

async function main() {
  const args = process.argv.slice(2);
  const flags = args.filter((arg) => arg.startsWith("--"));
  const [shopArg, categoryArg] = args.filter((arg) => !arg.startsWith("--"));
  const shop = shopSlugSchema.safeParse(shopArg);
  const category = categorySlugSchema.safeParse(categoryArg);
  const page = positiveInt(flagValue(flags, "page"));
  const list = positiveInt(flagValue(flags, "list"));
  const firstPageUrl =
    shop.success && category.success && list !== null
      ? SHOP_ADAPTERS[shop.data].categories[category.data]?.[list - 1]
      : undefined;
  if (!shop.success || !category.success || !firstPageUrl || page === null) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const saveFlag = flagValue(flags, "save");
  const saveName =
    saveFlag === undefined ? null : fixtureName(saveFlag, `${category.data}-p${page}`);
  if (saveFlag !== undefined && saveName === null) {
    console.error("--save=<name>: use only letters, digits and dashes.");
    process.exitCode = 1;
    return;
  }

  const adapter = SHOP_ADAPTERS[shop.data];
  const url = page > 1 ? adapter.pageUrl(firstPageUrl, page) : firstPageUrl;
  const userAgent = botUserAgent();
  const polite = createPoliteFetch({ userAgent });
  let outcome: FetchOutcome;
  if (adapter.fetchMethod === "browser") {
    const browser = createBrowserSource({ gate: polite, launch: launchPuppeteer, userAgent });
    try {
      outcome = await browser.get(url, undefined, adapter.browser);
    } finally {
      await browser.close();
    }
  } else {
    outcome = await polite.get(url);
  }
  console.log(`GET ${url} (${adapter.fetchMethod})`);
  if (outcome.kind !== "ok") {
    console.log(JSON.stringify(outcome));
    process.exitCode = 1;
    return;
  }
  console.log(`200 ${outcome.url} (${Buffer.byteLength(outcome.html)} bytes)`);

  if (saveName !== null) {
    const dir = path.resolve(__dirname, "../scraping/shops", shop.data, "__fixtures__");
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${saveName}.html`);
    const trimmed = fixtureHtml(outcome.html, shop.data);
    writeFileSync(file, trimmed);
    console.log(`saved ${file} (${Buffer.byteLength(trimmed)} bytes)`);
  }

  const { items, nextPageUrl } = adapter.parseListing(outcome.html, outcome.url);
  console.log(`items: ${items.length}, next: ${nextPageUrl ?? "none"}`);
  for (const item of items.slice(0, 3)) console.log(JSON.stringify(item));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
