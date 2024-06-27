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
const scrapeProducts = (page, keyword, storeId, scrapeId) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield page.$$(".product-items .product-item");
    const data = yield Promise.all(products.map((product) => __awaiter(void 0, void 0, void 0, function* () {
        const title = yield product.$eval("a.product-item-link", (element) => element.innerText.trim());
        const description = yield product.$eval(".product-item-description", (element) => element.innerText.trim());
        let price;
        try {
            price = yield product.$eval(".special-price .price-wrapper .price", (element) => element.innerText.trim());
        }
        catch (_a) {
            price = yield product.$eval(".price-box .price", (element) => element.innerText.trim());
        }
        let oldPrice;
        try {
            oldPrice = yield product.$eval(".old-price .price-wrapper .price", (element) => element.innerText.trim());
        }
        catch (_b) {
            oldPrice = null;
        }
        const link = yield product.$eval(".product-item-name a[href]", (element) => element.getAttribute("href"));
        const image = yield product.$eval(".product-item-photo-wrapper img[src]", (element) => element.getAttribute("src"));
        const productId = yield product.evaluate((element) => element.querySelector(".price-box").getAttribute("data-product-id"));
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
    })));
    return data;
});
const sanctaDomenicaScraping = (keyword, scrapeId) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_extra_1.default.launch({ headless: false });
    const page = yield browser.newPage();
    const storeName = "Sancta Domenica";
    const store = yield storesModel_1.Stores.findOne({ storeName: storeName });
    const storeId = store ? store._id.toString() : "";
    let data = [];
    yield page.goto(url_1.Url.SanctaDomenica);
    yield new Promise((resolve) => setTimeout(resolve, 3000));
    yield page.type("input.amsearch-input", keyword, { delay: 100 });
    yield Promise.all([
        page.waitForNavigation(),
        yield page.keyboard.press("Enter"),
    ]);
    yield new Promise((resolve) => setTimeout(resolve, 3000));
    data = data.concat(yield scrapeProducts(page, keyword, storeId, scrapeId));
    let lastPageReached = false;
    while (!lastPageReached) {
        const nextButtonPagination = yield page.$(".action.next");
        if (!nextButtonPagination) {
            lastPageReached = true;
        }
        else {
            yield page.evaluate(() => {
                const nextButton = document.querySelector(".action.next");
                if (nextButton) {
                    nextButton.click();
                }
            });
            yield new Promise((resolve) => setTimeout(resolve, 3000));
            data = data.concat(yield scrapeProducts(page, keyword, storeId, scrapeId));
        }
    }
    yield browser.close();
    return data;
});
module.exports = {
    sanctaDomenicaScraping,
};
