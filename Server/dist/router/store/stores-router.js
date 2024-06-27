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
const router = express_1.default.Router();
const addStore = require("./stores-service");
const { CustomBadRequest, CustomInternalServerError, CustomNotFound, } = require("../../middleware/CustomError");
router.post("/add", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { storeName } = req.body;
    if (storeName === "") {
        const err = new CustomNotFound("Ime trgovine je obavezno!");
        next(err);
    }
    try {
        const response = yield addStore({ storeName });
        if (response.success) {
            res
                .status(200)
                .json({ success: true, message: "Trgovina je uspješno dodana" });
        }
        else {
            let err;
            switch (response.error) {
                case "STORE_ALREADY_EXISTS":
                    err = CustomBadRequest("Trgovina je već dodana u bazu");
                    break;
                case "INSERTION_FAILED":
                    err = CustomInternalServerError("Došlo je do pogreške prilikom dodavanja trgovine u bazu");
                    break;
                default:
                    break;
            }
            return next(err);
        }
    }
    catch (error) {
        const err = new CustomInternalServerError("Došlo je do pogreške prilikom obrade zahtjeva");
        next(err);
    }
}));
module.exports = router;
