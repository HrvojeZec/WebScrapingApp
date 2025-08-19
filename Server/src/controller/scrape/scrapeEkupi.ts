/* import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Url } from '../../constants/url';
import { Stores } from '../../model/storesModel';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const scrapeProducts = async (
  page: any,
  keyword: string,
  storeId: string,
  scrapeId: string,
) => {
  const products = await page.$$('div.product__item');

  const data = await Promise.all(
    products.map(async (product: any) => {
      const title = await product.$eval('a.product__name', (el: HTMLElement) =>
        el.innerText.trim(),
      );

      let description = '';
      try {
        description = await product.$eval(
          'div.product__desc',
          (el: HTMLElement) => el.innerText.trim(),
        );
      } catch {
        description = '';
      }

      let price;
      try {
        price = await product.$eval(
          'span.product__price--active',
          (el: HTMLElement) => el.innerText.trim(),
        );
      } catch {
        price = 'N/A';
      }

      let oldPrice = null;
      try {
        oldPrice = await product.$eval(
          'span.product__price--old',
          (el: HTMLElement) => el.innerText.trim(),
        );
      } catch {
        oldPrice = null;
      }

      const link = await product.$eval('a.product__name', (el: HTMLElement) =>
        el.getAttribute('href'),
      );

      const image = await product.$eval('img.product__img', (el: HTMLElement) =>
        el.getAttribute('src'),
      );

      const productId = await product.evaluate(
        (el: any) => el.getAttribute('data-product-id') || null,
      );

      return {
        title,
        description,
        price,
        images: image,
        link: link?.startsWith('http') ? link : `https://www.ekupi.hr${link}`,
        productId,
        storeId,
        keyword,
        oldPrice,
        scrapeId,
      };
    }),
  );

  return data;
};

export const ekupiScraping = async (
  keyword: string,
  scrapeId: string,
  filePath?: string,
) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreDefaultArgs: ['--disable-extensions'],
  });
  const page = await browser.newPage();
  const storeName = 'eKupi';
  const store = await Stores.findOne({ storeName });
  const storeId = store ? store._id.toString() : '';

  if (filePath) {
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    await page.setContent(htmlContent);
  } else {
    const baseUrl = Url.Ekupi || 'https://www.ekupi.hr/';
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input#searchInput');
    await page.type('input#searchInput', keyword, { delay: 100 });

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.keyboard.press('Enter'),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  let data: any[] = [];
  data = data.concat(await scrapeProducts(page, keyword, storeId, scrapeId));

  if (!filePath) {
    let lastPageReached = false;
    while (!lastPageReached) {
      const nextButton = await page.$('a[rel="next"]');

      if (!nextButton) {
        lastPageReached = true;
      } else {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          nextButton.click(),
        ]);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        data = data.concat(
          await scrapeProducts(page, keyword, storeId, scrapeId),
        );
      }
    }
  }

  await browser.close();

  return data;
};

module.exports = {
  ekupiScraping,
};
 */
