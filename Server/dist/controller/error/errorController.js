"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function globalErrorhandler(error, req, res, next) {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
    });
}
module.exports = globalErrorhandler;
