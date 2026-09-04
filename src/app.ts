import express, { type Express } from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./errors/AppError.js";

export function createApp(): Express {
  const app: Express = express();

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "Success 🎉", message: "API is healthy 🙌🏼" });
  });

  app.use((_req, _Res) => {
    throw new NotFoundError("Route not found");
  });

  app.use(errorHandler);

  return app;
}
