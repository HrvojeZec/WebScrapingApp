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
const executeService = require("./scrape-service");
const { CustomBadRequest, CustomInternalServerError, CustomNotFound, CustomMultiStatus, } = require("../../middleware/CustomError");
const router = express_1.default.Router();
let scrapingInProgress = false;
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword } = req.body;
    //i dalje imam problem kod ovoga, kada pokrenem scrapanje i refresha stranicu i pokrenem ponovo
    //ovaj dio će se izvršiti i onda mi neće poslati  res.status(200).json({ status: "finished", products });
    // jer je već poslao response
    if (scrapingInProgress) {
        const err = new CustomBadRequest("Postupak je već u tijeku.");
        next(err);
    }
    try {
        scrapingInProgress = true;
        const products = yield executeService(keyword);
        res.status(200).json({ status: "finished", products });
    }
    catch (error) {
        const err = error;
        if (err.status === 404) {
            const customError = new CustomNotFound("Nema proizvoda za danu ključnu riječ u obje trgovine.");
            next(customError);
        }
        else if (err.products) {
            const customError = new CustomMultiStatus(` Neki izvori nisu uspješno scrapani.${err.products}`);
            next(customError);
        }
        else {
            const customError = new CustomInternalServerError(`Nešto je pošlo po krivu: ${err.message}`);
            next(customError);
        }
    }
    finally {
        scrapingInProgress = false;
    }
}));
module.exports = router;
