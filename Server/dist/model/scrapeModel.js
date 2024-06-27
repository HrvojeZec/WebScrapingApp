"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scrape = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const scrapeSchema = new Schema({
    keyword: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["initial", "started", "finished"],
        default: "initial",
    },
    startTime: { type: Date },
    endTime: { type: Date },
});
const Scrape = mongoose_1.default.model("Scrape", scrapeSchema);
exports.Scrape = Scrape;
