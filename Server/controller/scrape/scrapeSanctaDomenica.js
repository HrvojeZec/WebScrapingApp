const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const Product = require("../../model/productModel");
puppeteer.use(StealthPlugin());

const scrapeProducts = async (page, keyword) => {
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
      };
    })
  );
  console.log(data);
  return data;
};

const sanctaDomenicaScraping = async (url) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const keyword = "apple iphone 15";
  let data = [];
  await page.goto(url);
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

  await scrapeProducts(page, keyword);
  let lastPageRreached = false;

  while (!lastPageRreached) {
    const nextButtonPagination = await page.$(".action.next");
    console.log(nextButtonPagination);
    if (!nextButtonPagination) {
      lastPageRreached = true;
    } else {
      await page.evaluate(() => {
        document.querySelector(".action.next").click();
      });
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await scrapeProducts(page, keyword);
    }
  }
  data = data.concat(await scrapeProducts(page, keyword));
  console.log(data);
  await browser.close();

  try {
    await Product.create(data);
    console.log("Podaci uspješno spremljeni u MongoDB.");
    return data;
  } catch (error) {
    console.error("Greška prilikom spremanja podataka u MongoDB:", error);
  }
};

module.exports = {
  sanctaDomenicaScraping,
};
