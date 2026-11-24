import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { ElementHandle, Page } from "puppeteer";
import { Url } from "../../constants/url";
import { Stores } from "../../model/storesModel";
import fs from "fs";

puppeteer.use(StealthPlugin());
const scrapeProducts = async (page: Page, keyword: string, storeId: string, scrapeId: string) => {
  const products = await page.$$(".product-items .product-item");

  const data = await Promise.all(
    products.map(async (product: ElementHandle) => {
      const title = await product.$eval("a.product-item-link", (element) =>
        (element as HTMLElement).innerText.trim(),
      );
      const description = await product.$eval(".product-item-description", (element) =>
        (element as HTMLElement).innerText.trim(),
      );
      let price;
      try {
        price = await product.$eval(".special-price .price-wrapper .price", (element) =>
          (element as HTMLElement).innerText.trim(),
        );
      } catch {
        price = await product.$eval(".price-box .price", (element) =>
          (element as HTMLElement).innerText.trim(),
        );
      }

      let oldPrice;
      try {
        oldPrice = await product.$eval(".old-price .price-wrapper .price", (element) =>
          (element as HTMLElement).innerText.trim(),
        );
      } catch {
        oldPrice = null;
      }
      const link = await product.$eval(".product-item-link", (element) =>
        element.getAttribute("href"),
      );
      const image = await product.$eval(".product-item-photo-wrapper img[src]", (element) =>
        element.getAttribute("src"),
      );
      const productId = await product.evaluate((element) =>
        element.querySelector(".price-box")!.getAttribute("data-product-id"),
      );

      return {
        title: title,
        description: description,
        price: price,
        images: image,
        link: link,
        productId: productId,
        storeId: storeId,
        keyword: keyword,
        oldPrice: oldPrice,
        scrapeId: scrapeId,
      };
    }),
  );

  return data;
};
export const sanctaDomenicaScraping = async (
  keyword: string,
  scrapeId: string,
  filePath?: string,
) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  const page = await browser.newPage();
  const storeName = "Sancta Domenica";
  const store = await Stores.findOne({ storeName });
  const storeId = store ? store._id.toString() : "";

  if (filePath) {
    // Učitaj lokalni HTML fajl ako je `filePath` prisutan
    const htmlContent = fs.readFileSync(filePath, "utf-8");
    await page.setContent(htmlContent);
  } else {
    // Ako `filePath` nije prisutan, koristi URL za scrape
    await page.goto(Url.SanctaDomenica);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await page.type("input.amsearch-input", keyword, { delay: 100 });
    await Promise.all([page.waitForNavigation(), await page.keyboard.press("Enter")]);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  let data: Awaited<ReturnType<typeof scrapeProducts>> = [];
  data = data.concat(await scrapeProducts(page, keyword, storeId, scrapeId));

  // Ako koristimo lokalni HTML fajl, ne treba nam paginacija
  if (!filePath) {
    let lastPageReached = false;
    while (!lastPageReached) {
      const nextButtonPagination = await page.$(".action.next");

      if (!nextButtonPagination) {
        lastPageReached = true;
      } else {
        await page.evaluate(() => {
          const nextButton = document.querySelector(".action.next") as HTMLElement | null;
          if (nextButton) {
            nextButton.click();
          }
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));

        data = data.concat(await scrapeProducts(page, keyword, storeId, scrapeId));
      }
    }
  }

  await browser.close();

  return data;
};
