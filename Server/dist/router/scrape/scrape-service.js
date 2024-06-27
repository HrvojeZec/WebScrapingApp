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
Object.defineProperty(exports, "__esModule", { value: true });
const { mallScraping } = require("../../controller/scrape/scrapeMALL");
const { sanctaDomenicaScraping, } = require("../../controller/scrape/scrapeSanctaDomenica");
const productModel_1 = require("../../model/productModel");
const storesModel_1 = require("../../model/storesModel");
const scrapeModel_1 = require("../../model/scrapeModel");
const updateProductsPrice = (existingProducts, allNewProducts, scrapeId) => __awaiter(void 0, void 0, void 0, function* () {
    for (const newProduct of allNewProducts) {
        const existingProduct = existingProducts.find((product) => product.productId === newProduct.productId &&
            product.storeId === newProduct.storeId);
        if (existingProduct && existingProduct.price !== newProduct.price) {
            yield productModel_1.Product.updateOne({ _id: existingProduct._id }, {
                $set: {
                    price: newProduct.price,
                    oldPrice: existingProduct.price,
                    scrapeId: scrapeId,
                    new: true,
                },
            });
        }
    }
});
const addNewProducts = (allNewProducts, existingProducts) => __awaiter(void 0, void 0, void 0, function* () {
    const filteredProducts = allNewProducts.filter((newProduct) => !existingProducts.some((product) => product.productId === newProduct.productId));
    if (filteredProducts.length > 0) {
        yield productModel_1.Product.insertMany(filteredProducts);
    }
});
const executeService = (keyword) => __awaiter(void 0, void 0, void 0, function* () {
    const newScrapingJob = new scrapeModel_1.Scrape({
        status: "started",
        startTime: new Date(),
        keyword: keyword,
    });
    yield newScrapingJob.save();
    const scrapeId = newScrapingJob._id;
    const mallDataPromise = mallScraping(keyword, scrapeId);
    const sanctaDomenicaDataPromise = sanctaDomenicaScraping(keyword, scrapeId);
    const promises = [mallDataPromise, sanctaDomenicaDataPromise];
    const results = yield Promise.allSettled(promises);
    let allNewProducts = [];
    const errors = [];
    const isArrayEmpty = results.every((result) => result.status === "fulfilled" && result.value.length === 0);
    console.log("isArrayEmpty", isArrayEmpty);
    if (isArrayEmpty) {
        throw { status: 404 };
    }
    for (const [index, result] of results.entries()) {
        if (result.status === "rejected") {
            errors.push({
                functionName: `Function${index + 1}`,
                reason: result.reason,
            });
        }
        else {
            const newProducts = Array.isArray(result.value)
                ? result.value
                : result.value.data;
            if (Array.isArray(newProducts)) {
                allNewProducts.push(...newProducts);
            }
            else {
                errors.push({
                    functionName: `Function${index + 1}`,
                    reason: "Invalid data format",
                });
            }
        }
    }
    if (allNewProducts.length > 0) {
        const existingProducts = yield productModel_1.Product.find();
        if (existingProducts.length === 0) {
            yield productModel_1.Product.insertMany(allNewProducts);
        }
        else {
            yield updateProductsPrice(existingProducts, allNewProducts, scrapeId);
            yield addNewProducts(allNewProducts, existingProducts);
        }
    }
    const productsWithStoreAttributes = [];
    for (const product of allNewProducts) {
        const storeData = yield storesModel_1.Stores.findById(product.storeId);
        if (storeData) {
            const productWithStoreAttributes = Object.assign(Object.assign({}, product), { storeName: storeData.storeName, logo: storeData.logo });
            productsWithStoreAttributes.push(productWithStoreAttributes);
        }
    }
    newScrapingJob.status = "finished";
    newScrapingJob.endTime = new Date();
    yield newScrapingJob.save();
    if (errors.length > 0) {
        throw { products: productsWithStoreAttributes, errors };
    }
    return productsWithStoreAttributes;
});
module.exports = executeService;
