import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Url } from "../../constants/url";
import { Stores } from "../../model/storesModel";

puppeteer.use(StealthPlugin());

const checkForNoResults = async (page: any) => {
  const noResults = await page.$(".alert-box");

  if (noResults) {
    return true;
  } else {
    return false;
  }
};

const mallScraping = async (keyword: string, scrapeId: string) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const store = await Stores.findOne({ storeName: "Mall" });
  const storeId = store?._id;

  let prevHeight: any = -1;
  const maxScrolls: number = 100;
  let scrollCount: number = 0;

  await page.goto(Url.MallUrl);
  await new Promise((resolve) => setTimeout(resolve, 3000)); // cekaj 3 sekunde

  await page.waitForSelector("button#search-button"); // cekaj dok se ne pojavi button

  await page.type("input#site-search-input", keyword, { delay: 100 }); //dohvaca search id i ubacije key word unutra
  await new Promise((resolve) => setTimeout(resolve, 1000)); // cekaj 1 s
  await Promise.all([
    page.waitForNavigation(),
    await page.keyboard.press("Enter"), // KORISTIM KLIK NA ENTER
    // page.click("button#search-button"), // Klikni na gumb // OVO NE RADI
  ]);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  //provjeravamo da li postoji proizvod po keyword,
  //ako ne postoji baca nas na stranicu sa divom sa class-om alert-box alert-box--warning
  if (await checkForNoResults(page)) {
    await browser.close();
    return [];
  }

  // Main scroll loop
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);

  while (scrollCount < maxScrolls) {
    // Check if the button--loading element exists
    const isLoading = await page.evaluate(() =>
      document.querySelector(".button--loading")
    );

    // If the button--loading element exists, break the loop
    if (isLoading) {
      console.log("Loading in progress. Stopping scrolling.");
      break;
    }

    // Check if the button element exists and click on it
    const buttonExists = await page.evaluate(() =>
      document.querySelector(".button__wrapper")
    );

    if (buttonExists) {
      await page.click(".button__wrapper");
      console.log("Clicked on button");
    }

    const imgsSelector = ".gallery-list__wrap img[src]";
    await page.waitForSelector(imgsSelector);

    let currentScroll = 0;
    while (currentScroll < scrollHeight) {
      // Scroll to the next position
      await page.evaluate(
        (scrollHeight, currentScroll) => {
          window.scrollTo({
            top: currentScroll + 500,
            behavior: "smooth",
          });
        },
        scrollHeight,
        currentScroll
      );

      // Wait for a short time to allow content to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      currentScroll += 500;
    }

    // Calculate new scroll height and compare
    const newHeight = await page.evaluate("document.body.scrollHeight");
    console.log("new Height: ", newHeight);
    console.log("prevHeight: ", prevHeight);
    if (newHeight == prevHeight) {
      console.log("Reached end of page");
      break;
    }
    prevHeight = newHeight;
    scrollCount += 1;
  }

  // dohvacanje podataka
  const products = await page.$$(".category-products .pbcr");

  const data = await Promise.all(
    products.map(async (product) => {
      const title = await product.$eval(
        ".pb-brief__title-wrap .pb-brief__title",
        (element) => (element as HTMLElement).innerText.trim()
      );

      const description = await product.evaluate((element: any) => {
        const brief = element.querySelector(".pb-brief__brief");
        if (!brief) return "";

        const p = brief.querySelector("p");
        if (p) return p.innerText.trim();

        const span = brief.querySelector("span");
        if (span) return span.innerText.trim();

        return brief.innerText.trim();
      });
      const price = await product.$eval(".pb-price__price span", (element) =>
        element.innerText.trim()
      );
      const link = await product.$eval(".pb-price a[href]", (element) =>
        element.getAttribute("href")
      );
      const imgs = await product.$$eval(".hooper-slide img[src]", (imgs) =>
        Array.isArray(imgs)
          ? imgs.map((img) => img.getAttribute("src") || "")
          : []
      );
      const productId = await product.evaluate((element) =>
        element.getAttribute("data-scroll-id")
      );

      const uniqueImages = [...new Set(imgs)].map((img) => {
        return img.startsWith("https://www.mall.hr")
          ? img
          : `https://www.mall.hr${img}`;
      });
      let oldPrice: string | null;
      try {
        oldPrice = await product.$eval(".pb-price__price-old", (element) =>
          (element as HTMLElement).innerText.trim()
        );
      } catch {
        oldPrice = null;
      }

      return {
        title: title,
        description: description,
        price: price,
        images: uniqueImages,
        link: `https://www.mall.hr${link}`,
        productId: productId,
        storeId: storeId,
        keyword: keyword,
        oldPrice: oldPrice,
        scrapeId: scrapeId,
      };
    })
  );

  await browser.close();

  return data;
};

module.exports = {
  mallScraping,
};
