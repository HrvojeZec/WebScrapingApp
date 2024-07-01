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
const storesModel_1 = require("../../model/storesModel");
const productModel_1 = require("../../model/productModel");
const paginationHandler = (keyword, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProducts = yield productModel_1.Product.find({ keyword });
    const dataLength = existingProducts.length;
    const totalPages = Math.ceil(dataLength / pageSize);
    const skip = (page - 1) * pageSize;
    const limit = pageSize;
    return { totalPages, skip, limit };
});
const findProductsByKeyword = (keyword, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProducts = yield productModel_1.Product.find({ keyword })
        .skip(skip)
        .limit(limit);
    let result = [];
    if (existingProducts.length > 0) {
        for (const product of existingProducts) {
            const store = yield storesModel_1.Stores.findById(product.storeId);
            if (store) {
                const productWithStoreAttributes = Object.assign(Object.assign({}, product.toObject()), { storeName: store.storeName, logo: store.logo });
                result.push(productWithStoreAttributes);
            }
        }
    }
    return result;
});
const findAllProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const existingProducts = yield productModel_1.Product.find();
    let result = [];
    for (const product of existingProducts) {
        const store = yield storesModel_1.Stores.findById(product.storeId);
        if (store) {
            const productWithStoreAttributes = Object.assign(Object.assign({}, product.toObject()), { storeName: store.storeName, logo: store.logo });
            result.push(productWithStoreAttributes);
        }
    }
    return result;
});
const findRandomProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productModel_1.Product.aggregate([{ $sample: { size: 10 } }]);
    return result;
});
const findAllKeywords = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield productModel_1.Product.distinct("keyword");
    return result;
});
const findProductsByScrapeId = (scrapeId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProducts = yield productModel_1.Product.find({ scrapeId });
    console.log(existingProducts);
    let result = [];
    if (existingProducts.length > 0) {
        for (const product of existingProducts) {
            const store = yield storesModel_1.Stores.findById(product.storeId);
            if (store) {
                const productWithStoreAttributes = Object.assign(Object.assign({}, product.toObject()), { storeName: store.storeName, logo: store.logo });
                result.push(productWithStoreAttributes);
            }
        }
    }
    return result;
});
module.exports = {
    findAllKeywords,
    findProductsByKeyword,
    findAllProducts,
    findRandomProducts,
    findProductsByScrapeId,
    paginationHandler,
};
