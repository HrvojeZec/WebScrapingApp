const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const Url = require("../../constants/url");
const Store = require("../../model/storesModel");

puppeteer.use(StealthPlugin());

const scrapeProducts = async (page, keyword, storeId) => {
  const products = await page.$$(".product-items .product-item");

  const data = await Promise.all(
    products.map(async (product) => {
      const title = await product.$eval("a.product-item-link", (element) =>
        element.innerText.trim()
      );
      const description = await product.$eval(
        ".product-item-description",
        (element) => element.innerText.trim()
      );
      let price;
      try {
        price = await product.$eval(
          ".special-price .price-wrapper .price",
          (element) => element.innerText.trim()
        );
      } catch {
        price = await product.$eval(".price-box .price", (element) =>
          element.innerText.trim()
        );
      }

      let oldPrice;
      try {
        oldPrice = await product.$eval(
          ".old-price .price-wrapper .price",
          (element) => element.innerText.trim()
        );
      } catch {
        oldPrice = null;
      }

      const link = await product.$eval(
        ".product-item-name a[href]",
        (element) => element.getAttribute("href")
      );
      const image = await product.$eval(
        ".product-item-photo-wrapper img[src]",
        (element) => element.getAttribute("src")
      );
      const productId = await product.evaluate((element) =>
        element.querySelector(".price-box").getAttribute("data-product-id")
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
      };
    })
  );

  return data;
};

const sanctaDomenicaScraping = async (keyword) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const storeName = "Sancta Domenica";
  const store = await Store.findOne({ storeName: storeName });
  const storeId = store._id;

  let data = [];
  await page.goto(Url.SanctaDomenica);
  await new Promise((resolve) => setTimeout(resolve, 3000)); // cekaj 3 sekunde
  await page.screenshot({
    path: "./images/Santadomenica.png",
    fullPage: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.type("input.amsearch-input", keyword.keyword, { delay: 100 });
  await Promise.all([
    page.waitForNavigation(),
    await page.keyboard.press("Enter"),
  ]);

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.screenshot({
    path: "./images/SantadomenicaKeyword.png",
    fullPage: true,
  });

  data = data.concat(await scrapeProducts(page, keyword.keyword, storeId));
  let lastPageRreached = false;

  while (!lastPageRreached) {
    const nextButtonPagination = await page.$(".action.next");

    if (!nextButtonPagination) {
      lastPageRreached = true;
    } else {
      await page.evaluate(() => {
        document.querySelector(".action.next").click();
      });
      await new Promise((resolve) => setTimeout(resolve, 3000));

      data = data.concat(await scrapeProducts(page, keyword.keyword, storeId));
    }
  }

  await browser.close();

  return data;
};

module.exports = {
  sanctaDomenicaScraping,
};
