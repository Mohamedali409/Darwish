import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";
import { AppError } from "./app-error.js";

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((issue) => issue.message).join(", ");

        next(new AppError(400, message));
        return;
      }

      next(error);
    }
  };
}
