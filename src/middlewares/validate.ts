import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/AppError.js";

export function validate(schema: z.ZodSchema, source: "body" | "query" = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      throw new ValidationError("Invalid input data", z.treeifyError(result.error));
    }

    if (source === "query") {
      req.validatedQuery = result.data as Record<string, unknown>;
    } else {
      req.body = result.data;
    }

    next();
  };
}
