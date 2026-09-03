import { createApp } from "./app.js";

const startServer = async (): Promise<void> => {
  try {
    const app = createApp();
    const port = Number(process.env.PORT);

    if (isNaN(port)) {
      throw new Error("Invalid port number");
    }

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
