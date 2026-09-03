import express, { type Express } from "express";

export function createApp(): Express {
  const app: Express = express();

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "Success 🎉", message: "API is healthy 🙌🏼" });
  });
  return app;
}
