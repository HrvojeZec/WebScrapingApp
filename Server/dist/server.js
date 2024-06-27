"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config();
const scrapeRoute = require("./router/scrape/scrape-router");
const storeRouter = require("./router/store/stores-router");
const productRouter = require("./router/product/product-router");
const globalErrorhandler = require("./controller/error/errorController");
const { createStoreData } = require("./router/store/stores-service");
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use("/api/scrape", scrapeRoute);
app.use("/api/storeData", storeRouter);
app.use("/api/products", productRouter);
app.use(globalErrorhandler);
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
mongoose_1.default
    .connect(`mongodb+srv://hrvojezec99:${process.env.MONGODB_PASSWORD}@cluster0.pkwobu1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
    console.log("Database is connected");
    createStoreData();
})
    .catch((err) => {
    console.log(err);
});
