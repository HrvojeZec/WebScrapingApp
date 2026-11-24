import { NextFunction, Request, Response } from "express";

function globalErrorhandler(error: any, req: Request, res: Response) {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
  });
}

module.exports = globalErrorhandler;
