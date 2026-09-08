import pino from "pino";
import { env } from "../config/env.js";

const logger = pino({
  transport: env.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
});

export { logger };
