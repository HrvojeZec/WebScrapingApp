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
const express_1 = __importDefault(require("express"));
const { findProductsByKeyword, findAllProducts, findRandomProducts, findAllKeywords, findProductsByScrapeId, paginationHandler, } = require("../product/product-service");
const { CustomBadRequest, CustomInternalServerError, CustomNotFound, } = require("../../middleware/CustomError");
const router = express_1.default.Router();
// Get products by keyword
router.get("/keyword", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, page, pageSize } = req.query;
    if (!keyword || (typeof keyword !== "string") || keyword.trim().length === 0) {
        const err = new CustomBadRequest("Molimo unesite ključnu riječ za pretragu proizvoda.");
        return next(err);
    }
    try {
        const paginationData = yield paginationHandler(keyword, page, pageSize);
        const products = yield findProductsByKeyword(keyword, paginationData.skip, paginationData.limit);
        if (products.length === 0) {
            const err = new CustomNotFound("Nema proizvoda s danom ključnom riječi.");
            return next(err);
        }
        return res.status(200).json({
            products,
            totalPages: paginationData.totalPages,
            currentPage: page,
        });
    }
    catch (error) {
        const err = new CustomInternalServerError("Došlo je do pogreške prilikom pretrage proizvoda.");
        return next(err);
    }
}));
// Get all products
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield findAllProducts();
        return res.status(200).json(products);
    }
    catch (error) {
        const err = new CustomInternalServerError("Došlo je do pogreške prilikom dohvata svih proizvoda.");
        return next(err);
    }
}));
// Get 10 random products
router.get("/randomProducts", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield findRandomProducts();
        return res.status(200).json(products);
    }
    catch (error) {
        const err = new CustomInternalServerError("Došlo je do pogreške prilikom dohvata nasumičnih proizvoda.");
        return next(err);
    }
}));
router.get("/allKeywords", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield findAllKeywords();
        return res.status(200).json(response);
    }
    catch (error) {
        const err = new CustomInternalServerError("Došlo je do greške prilikom dohvaćanja keyowrds-a.");
        return next(err);
    }
}));
//dohvacanje proizvoda po scrapeIdu ako su finished
router.get("/scrapeId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const scrapeId = req.query.scrapeId;
    try {
        const response = yield findProductsByScrapeId(scrapeId);
        console.log(response);
        if (response.length === 0) {
            const err = new CustomNotFound("Nema proizvoda s danim scrape ID-om.");
            return next(err);
        }
        return res.status(200).json(response);
    }
    catch (error) {
        const err = new CustomInternalServerError("Došlo je do pogreške prilikom pretrage proizvoda.");
        return next(err);
    }
}));
module.exports = router;
