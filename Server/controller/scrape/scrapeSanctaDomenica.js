const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const Url = require("../../constants/url");

puppeteer.use(StealthPlugin());

const scrapeProducts = async (page, keyword, storeName) => {
  const products = await page.$$(".product-items .product-item");

  const data = await Promise.all(
    products.map(async (product) => {
      const title = await page.$eval("a.product-item-link", (element) =>
        element.innerText.trim()
      );
      const description = await page.$eval(
        ".product-item-description",
        (element) => element.innerText.trim()
      );
      const price = await page.$eval(".product-item-description", (element) =>
        element.innerText.trim()
      );
      const link = await page.$eval(".product-item-name a[href]", (element) =>
        element.getAttribute("href")
      );
      const image = await page.$eval(
        ".product-item-photo-wrapper img[src]",
        (element) => element.getAttribute("src")
      );
      const logo = await page.$eval("a.logo img[src]", (element) =>
        element.getAttribute("src")
      );
      return {
        title: title,
        description: description,
        price: price,
        images: image,
        link: link,
        logo: logo,
        keyword: keyword,
        storeName: storeName,
      };
    })
  );

  return data;
};

const sanctaDomenicaScraping = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const storeName = "SanctaDomenica";
  const keyword = "apple iphone 15";
  let data = [];
  await page.goto(Url.SanctaDomenica);
  await new Promise((resolve) => setTimeout(resolve, 3000)); // cekaj 3 sekunde
  await page.screenshot({
    path: "./images/Santadomenica.png",
    fullPage: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.type("input.amsearch-input", keyword, { delay: 100 });
  await Promise.all([
    page.waitForNavigation(),
    await page.keyboard.press("Enter"),
  ]);

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.screenshot({
    path: "./images/SantadomenicaKeyword.png",
    fullPage: true,
  });

  data = data.concat(await scrapeProducts(page, keyword, storeName));
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

      data = data.concat(await scrapeProducts(page, keyword, storeName));
    }
  }

  await browser.close();

  return data;
};

module.exports = {
  sanctaDomenicaScraping,
};
