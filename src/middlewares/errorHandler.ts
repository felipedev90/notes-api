import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../errors/AppError.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      ...(err instanceof ValidationError && { details: err.details }),
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    status: "error",
    message: "Something went wrong. Try again later...",
  });
}
