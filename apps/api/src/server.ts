import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app";
import { env } from "./config";
import { createLogger } from "./http/logger";

const logger = createLogger(env.LOG_LEVEL);
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function start() {
  // Connect first, so the API never accepts requests it cannot serve
  try {
    await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  } catch (error) {
    logger.fatal({ err: error }, "could not connect to MongoDB");
    process.exit(1);
  }
  // No ensureStores here: over the demo database the API must not add real shops
  logger.info({ db: mongoose.connection.name }, "database connected");

  const server = createApp({ clientUrl: env.CLIENT_URL, logger }).listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "API listening");
  });

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info({ signal }, "shutting down");
    // A hanging connection must not keep the process alive forever
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
    server.close(() => {
      mongoose.disconnect().finally(() => process.exit(0));
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

start().catch((error: unknown) => {
  logger.fatal({ err: error }, "startup failed");
  process.exit(1);
});
