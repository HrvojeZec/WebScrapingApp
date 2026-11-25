import { z } from "zod";
import { LOG_LEVELS } from "../http/logger";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z
    .string({ error: "is required" })
    .regex(/^mongodb(\+srv)?:\/\//, "must start with mongodb:// or mongodb+srv://"),
  // Overrides the database in the URI, e.g. storeseeker-demo for the seeded demo data
  MONGODB_DB_NAME: z
    .string()
    .regex(/^[A-Za-z0-9_-]{1,38}$/, "must be 1-38 letters, digits, _ or -")
    .optional(),
  // cors() compares the origin as an exact string, so "http://localhost:5173/" would block every request
  CLIENT_URL: z
    .url()
    .default("http://localhost:5173")
    .transform((value) => new URL(value).origin),
  LOG_LEVEL: z.enum(LOG_LEVELS).default("info"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  // Empty values (e.g. "MONGODB_URI=" in .env) count as missing, so defaults and "is required" apply
  const input = Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ""));
  const result = envSchema.safeParse(input);
  if (!result.success) {
    const lines = result.error.issues.map((issue) => `- ${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid environment variables:\n${lines.join("\n")}`);
  }
  return result.data;
}
