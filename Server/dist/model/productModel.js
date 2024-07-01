"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const productSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    price: {
        type: String,
        required: true,
    },
    oldPrice: {
        type: String,
        required: false,
    },
    images: {
        type: [String],
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    keyword: {
        type: String,
        required: true,
    },
    storeId: {
        type: Schema.Types.ObjectId,
        ref: "Store",
        required: true,
    },
    scrapeId: {
        type: Schema.Types.ObjectId,
        ref: "Scrape",
        required: true,
    },
    productId: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const Product = mongoose_1.default.model("Product", productSchema);
exports.Product = Product;
