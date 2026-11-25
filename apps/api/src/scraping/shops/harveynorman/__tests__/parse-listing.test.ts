import { readFileSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { describe, expect, test } from "vitest";
import { parseListing } from "../parse-listing";

// Saved 25.11.2026 with scrape:live-check from /mobiteli/smartphone (p=1 and p=24) and
// /mobiteli/slusalice (p=1)
const FIXTURES = path.resolve(__dirname, "../__fixtures__");
const PAGE_URL = "https://www.harveynorman.hr/mobiteli/smartphone";

function fixture(name: string): string {
  return readFileSync(path.join(FIXTURES, `${name}.html`), "utf8");
}

describe("Harvey Norman parseListing", () => {
  const firstPage = parseListing(fixture("mobiteli-p1"), PAGE_URL);

  test("reads every product card of a page", () => {
    expect(firstPage.items).toHaveLength(10);
  });

  test("reads the shop's product ID, title, absolute links and price of a card", () => {
    expect(firstPage.items[0]).toEqual({
      externalId: "1489997",
      title: "Mobitel Samsung Galaxy A25 - 6GB/128GB - Crni",
      url: "https://www.harveynorman.hr/mobitel-samsung-galaxy-a25-6gb-128gb-crni",
      imageUrl:
        "https://www.harveynorman.hr/media/catalog/product/cache/6604fa418098cc096931e54752c1c91e/1/7/1720539_1_web.jpeg",
      priceCents: 32_999,
      regularPriceCents: null,
      available: true,
    });
  });

  test("a product on sale has its regular price above the price", () => {
    const redmi = firstPage.items.find((item) => item.externalId === "3846596");
    expect(redmi).toMatchObject({ priceCents: 10_999, regularPriceCents: 11_999 });

    const sales = parseListing(
      fixture("slusalice-p1"),
      "https://www.harveynorman.hr/mobiteli/slusalice",
    );
    expect(sales.items.find((item) => item.externalId === "4116267")).toMatchObject({
      title: "Bežične slušalice HUAWEI FreeClip 2",
      priceCents: 16_998,
      regularPriceCents: 19_999,
    });
  });

  test("the next page is an absolute URL on the shop's origin", () => {
    const next = new URL(firstPage.nextPageUrl!);
    expect(next.origin).toBe("https://www.harveynorman.hr");
    expect(next.searchParams.get("p")).toBe("2");
  });

  test("the last page has no next page", () => {
    const last = parseListing(fixture("mobiteli-last"), `${PAGE_URL}?p=24`);
    expect(last.items).toHaveLength(8);
    expect(last.nextPageUrl).toBeNull();
  });

  test("skips a card without a price instead of failing", () => {
    const $ = cheerio.load(fixture("mobiteli-p1"));
    $(".product-item").first().find(".price-box, .price").remove();
    const { items } = parseListing($.html(), PAGE_URL);
    expect(items).toHaveLength(9);
    expect(items.map((item) => item.externalId)).not.toContain("1489997");
  });

  test("ignores product cards outside the listing, such as a sidebar widget", () => {
    const $ = cheerio.load(fixture("mobiteli-p1"));
    $("body").append(
      `<div class="sidebar"><ol><li class="item product product-item">
        <div class="product-item-info" id="product-item-info_999">
          <a class="product-item-link" href="/recently-viewed">Recently viewed</a>
          <span data-price-type="finalPrice" data-price-amount="9.99"></span>
        </div></li></ol></div>`,
    );
    const { items } = parseListing($.html(), PAGE_URL);
    expect(items).toHaveLength(10);
    expect(items.map((item) => item.externalId)).not.toContain("999");
  });

  test("a card listed twice on a page is read once", () => {
    const $ = cheerio.load(fixture("mobiteli-p1"));
    const list = $(".products.wrapper .product-items");
    list.append(list.children(".product-item").first().clone());
    const { items } = parseListing($.html(), PAGE_URL);
    expect(items).toHaveLength(10);
    expect(new Set(items.map((item) => item.externalId)).size).toBe(10);
  });

  test("an empty page has no items and no next page", () => {
    expect(parseListing("", PAGE_URL)).toEqual({ items: [], nextPageUrl: null });
  });
});
