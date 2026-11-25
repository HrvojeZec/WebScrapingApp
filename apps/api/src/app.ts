import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { LIMITS } from "@storeseeker/shared";
import { errorHandler, notFoundHandler } from "./http/error-handler";
import type { Logger } from "./http/logger";
import { rateLimitedHandler, type ApiRateLimit } from "./http/rate-limit-api";
import { checkOrigin, requireJson } from "./http/security";
import { createApiRouter } from "./routes";

export type AppOptions = { clientUrl: string; logger: Logger; apiRateLimit?: ApiRateLimit };

// Takes its settings as arguments instead of reading env, so tests can build it without a database
export function createApp({
  clientUrl,
  logger,
  apiRateLimit = LIMITS.apiRequests,
}: AppOptions): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: clientUrl }));
  app.use(
    pinoHttp({
      logger,
      // Method, URL and status only: headers carry cookies, and IP addresses are not logged
      serializers: {
        req: (req: { id: unknown; method: string; url: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  // Before body parsing, so a client over the limit costs as little as possible
  app.use(
    "/api",
    rateLimit({
      windowMs: apiRateLimit.windowMs,
      limit: apiRateLimit.max,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      handler: rateLimitedHandler,
    }),
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(checkOrigin(clientUrl));
  app.use(requireJson);
  app.use("/api", createApiRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
