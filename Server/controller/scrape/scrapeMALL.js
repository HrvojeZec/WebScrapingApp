const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const Url = require("../../constants/url");

puppeteer.use(StealthPlugin());

const mallScraping = async (res, req, next) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const storeName = "Mall";
  const keyword = "apple iphone 15";
  let prevHeight = -1;
  let maxScrolls = 100;
  let scrollCount = 0;

  await page.goto(Url.MallUrl);
  await new Promise((resolve) => setTimeout(resolve, 3000)); // cekaj 3 sekunde
  await page.screenshot({
    path: "./images/PrviDioStranice.png",
    fullPage: true,
  });
  const btn = await page.waitForSelector("button#search-button"); // cekaj dok se ne pojavi button

  // Dohvati logo Mall-a ako postoji
  const mallLogoHTML = await page.evaluate(() => {
    const headerCol = document.querySelector(".header__col");
    if (headerCol) {
      const basicLink = headerCol.querySelector(".basic-link");
      if (basicLink) {
        const svgElement = basicLink.querySelector("svg.icon");
        if (svgElement) {
          return svgElement.outerHTML;
        }
      }
    }
    return null; // Vrati null ako ne uspije pronaći SVG element
  });

  await page.type("input#site-search-inpu", keyword, { delay: 100 }); //dohvaca search id i ubacije key word unutra
  await new Promise((resolve) => setTimeout(resolve, 1000)); // cekaj 1 s
  await Promise.all([
    page.waitForNavigation(),
    await page.keyboard.press("Enter"), // KORISTIM KLIK NA ENTER
    // page.click("button#search-button"), // Klikni na gumb // OVO NE RADI NE ZNAM ZASTO !!!!!!!!!!!!!
  ]);

  await new Promise((resolve) => setTimeout(resolve, 3000));

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
    let newHeight = await page.evaluate("document.body.scrollHeight");
    console.log("new Height: ", newHeight);
    console.log("prevHeight: ", prevHeight);
    if (newHeight == prevHeight) {
      console.log("Reached end of page");
      break;
    }
    prevHeight = newHeight;
    scrollCount += 1;
  }

  await page.screenshot({
    path: "images/scroll.png",
    fullPage: true,
  });

  // dohvacanje podataka
  const products = await page.$$(".category-products .pbcr");

  const data = await Promise.all(
    products.map(async (product) => {
      const title = await product.$eval(
        ".pb-brief__title-wrap .pb-brief__title",
        (element) => element.innerText.trim()
      );
      const description = await product.$eval(".pb-brief__brief p", (element) =>
        element.innerText.trim()
      );
      const price = await product.$eval(".pb-price__price span", (element) =>
        element.innerText.trim()
      );
      const link = await product.$eval(".pb-price a[href]", (element) =>
        element.getAttribute("href")
      );
      const imgs = await product.$$eval(
        ".gallery-list__wrap img[src]",
        (imgs) =>
          Array.isArray(imgs) ? imgs.map((img) => img.getAttribute("src")) : []
      );

      const uniqueImages = [...new Set(imgs)]; //micemo sve duplikate
      return {
        title: title,
        description: description,
        price: price,
        images: uniqueImages,
        link: link,
        logo: mallLogoHTML,
        keyword: keyword,
        storeName: storeName,
      };
    })
  );

  await page.screenshot({
    path: "images/DrugiDioStranice.png",
    fullPage: true,
  });
  await browser.close();

  return data;
};

module.exports = {
  mallScraping,
};
