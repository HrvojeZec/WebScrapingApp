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
const { StoresData } = require("../../boostrap/setup");
const addStore = (_a) => __awaiter(void 0, [_a], void 0, function* ({ storeName }) {
    const existingStoreName = yield storesModel_1.Stores.findOne({ storeName: storeName });
    if (existingStoreName) {
        return { success: false, error: "STORE_ALREADY_EXISTS" };
    }
    else {
        const store = [{ logo: null, storeName: storeName }];
        const result = yield storesModel_1.Stores.insertMany(store);
        if (result) {
            return { success: true };
        }
        else {
            return { success: false, error: "INSERTION_FAILED" };
        }
    }
});
const createStoreData = () => __awaiter(void 0, void 0, void 0, function* () {
    const stores = yield storesModel_1.Stores.find();
    const existingStoreNames = stores.map((store) => store.storeName).filter((name) => !!name);
    const newStoreNames = StoresData.map((data) => data.storeName).filter((name) => !existingStoreNames.includes(name));
    if (newStoreNames.length > 0) {
        const newStores = StoresData.filter((data) => newStoreNames.includes(data.storeName));
        yield storesModel_1.Stores.insertMany(newStores);
        console.log("New stores added to the database: ", newStoreNames);
    }
    else {
        console.log("No new stores added to the database.");
    }
});
module.exports = { addStore, createStoreData };
