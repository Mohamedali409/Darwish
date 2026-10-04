import type { NextFunction, Request, Response } from "express";
import { AppError } from "./app-error.js";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: "Country code already exists",
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
