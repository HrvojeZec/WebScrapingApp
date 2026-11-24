import { Request, Response } from "express";

interface HttpError {
  statusCode?: number;
  status?: string;
  message?: string;
}

function globalErrorhandler(error: HttpError, req: Request, res: Response) {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
  });
}

export default globalErrorhandler;
