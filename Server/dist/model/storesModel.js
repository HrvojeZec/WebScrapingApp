"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stores = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const storesSchema = new Schema({
    logo: {
        type: String,
        required: false,
    },
    storeName: {
        type: String,
        required: true,
    },
});
const Stores = mongoose_1.default.model("Stores", storesSchema);
exports.Stores = Stores;
