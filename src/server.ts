import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";

const startServer = async (): Promise<void> => {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Servidor rodando na porta ${String(env.PORT)} 🚀`);
  });

  const shutdown = async () => {
    logger.info("Encerrando servidor...");
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};
startServer();
