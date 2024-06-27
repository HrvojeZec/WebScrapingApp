"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const url_1 = require("../../constants/url");
const storesModel_1 = require("../../model/storesModel");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
const checkForNoResults = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const noResults = yield page.$(".alert-box");
    if (noResults) {
        return true;
    }
    else {
        return false;
    }
});
const mallScraping = (keyword, scrapeId) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_extra_1.default.launch({ headless: false });
    const page = yield browser.newPage();
    const store = yield storesModel_1.Stores.findOne({ storeName: "Mall" });
    const storeId = store === null || store === void 0 ? void 0 : store._id;
    let prevHeight = -1;
    let maxScrolls = 100;
    let scrollCount = 0;
    yield page.goto(url_1.Url.MallUrl);
    yield new Promise((resolve) => setTimeout(resolve, 3000)); // cekaj 3 sekunde
    const btn = yield page.waitForSelector("button#search-button"); // cekaj dok se ne pojavi button
    yield page.type("input#site-search-input", keyword, { delay: 100 }); //dohvaca search id i ubacije key word unutra
    yield new Promise((resolve) => setTimeout(resolve, 1000)); // cekaj 1 s
    yield Promise.all([
        page.waitForNavigation(),
        yield page.keyboard.press("Enter"),
        // page.click("button#search-button"), // Klikni na gumb // OVO NE RADI NE ZNAM ZASTO !!!!!!!!!!!!!
    ]);
    yield new Promise((resolve) => setTimeout(resolve, 3000));
    //provjeravamo da li postoji proizvod po keyword,
    //ako ne postoji baca nas na stranicu sa divom sa class-om alert-box alert-box--warning
    if (yield checkForNoResults(page)) {
        yield browser.close();
        return [];
    }
    // Main scroll loop
    const scrollHeight = yield page.evaluate(() => document.body.scrollHeight);
    while (scrollCount < maxScrolls) {
        // Check if the button--loading element exists
        const isLoading = yield page.evaluate(() => document.querySelector(".button--loading"));
        // If the button--loading element exists, break the loop
        if (isLoading) {
            console.log("Loading in progress. Stopping scrolling.");
            break;
        }
        // Check if the button element exists and click on it
        const buttonExists = yield page.evaluate(() => document.querySelector(".button__wrapper"));
        if (buttonExists) {
            yield page.click(".button__wrapper");
            console.log("Clicked on button");
        }
        const imgsSelector = ".gallery-list__wrap img[src]";
        yield page.waitForSelector(imgsSelector);
        let currentScroll = 0;
        while (currentScroll < scrollHeight) {
            // Scroll to the next position
            yield page.evaluate((scrollHeight, currentScroll) => {
                window.scrollTo({
                    top: currentScroll + 500,
                    behavior: "smooth",
                });
            }, scrollHeight, currentScroll);
            // Wait for a short time to allow content to load
            yield new Promise((resolve) => setTimeout(resolve, 2000));
            currentScroll += 500;
        }
        // Calculate new scroll height and compare
        let newHeight = yield page.evaluate("document.body.scrollHeight");
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
    const products = yield page.$$(".category-products .pbcr");
    const data = yield Promise.all(products.map((product) => __awaiter(void 0, void 0, void 0, function* () {
        const title = yield product.$eval(".pb-brief__title-wrap .pb-brief__title", (element) => element.innerText.trim());
        const description = yield product.evaluate((element) => {
            const brief = element.querySelector(".pb-brief__brief");
            if (!brief)
                return "";
            const p = brief.querySelector("p");
            if (p)
                return p.innerText.trim();
            const span = brief.querySelector("span");
            if (span)
                return span.innerText.trim();
            return brief.innerText.trim();
        });
        const price = yield product.$eval(".pb-price__price span", (element) => element.innerText.trim());
        const link = yield product.$eval(".pb-price a[href]", (element) => element.getAttribute("href"));
        const imgs = yield product.$$eval(".hooper-slide img[src]", (imgs) => Array.isArray(imgs) ? imgs.map((img) => img.getAttribute("src") || "") : []);
        const productId = yield product.evaluate((element) => element.getAttribute("data-scroll-id"));
        const uniqueImages = [...new Set(imgs)].map((img) => {
            return img.startsWith("https://www.mall.hr")
                ? img
                : `https://www.mall.hr${img}`;
        });
        let oldPrice;
        try {
            oldPrice = yield product.$eval(".pb-price__price-old", (element) => element.innerText.trim());
        }
        catch (_a) {
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
    })));
    yield browser.close();
    return data;
});
module.exports = {
    mallScraping,
};
