import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/AppError.js";

export function validate(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ValidationError("Invalid input data", z.treeifyError(result.error));
    }

    req.body = result.data;
    next();
  };
}
