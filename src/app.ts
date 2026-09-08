import express, { type Express } from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./errors/AppError.js";
import authRouter from "./modules/auth/auth.route.js";
import notesRouter from "./modules/notes/notes.route.js";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.js";

export function createApp(): Express {
  const app: Express = express();

  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "Success 🎉", message: "API is healthy 🙌🏼" });
  });

  app.use("/auth", authRouter);
  app.use("/notes", notesRouter);
  app.use((_req, _Res) => {
    throw new NotFoundError("Route not found");
  });

  app.use(errorHandler);

  return app;
}
