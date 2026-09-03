import { createApp } from "./app.js";
import { env } from "./config/env.js";

const startServer = async (): Promise<void> => {
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Servidor rodando na porta ${String(env.PORT)} 🚀`);
  });
};

startServer();
