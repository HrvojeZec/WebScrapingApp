import { z } from "zod";

const port = z.coerce.number().int().min(1).max(65535);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: port.default(5000),
  PORT_STATUS: port.default(5001),
  MONGODB_URI: z
    .string({ error: "is required" })
    .regex(/^mongodb(\+srv)?:\/\//, "must start with mongodb:// or mongodb+srv://"),
  // cors() compares the origin as an exact string, so "http://localhost:5173/" would block every request
  CLIENT_URL: z
    .url()
    .default("http://localhost:5173")
    .transform((value) => new URL(value).origin),
  EXECUTE_URL: z.url().optional(),
});

export type Env = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  PORT_STATUS: number;
  MONGODB_URI: string;
  CLIENT_URL: string;
  EXECUTE_URL: string;
};

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  // Empty values (e.g. "MONGODB_URI=" in .env) count as missing, so defaults and "is required" apply
  const input = Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ""));
  const result = envSchema.safeParse(input);
  if (!result.success) {
    const lines = result.error.issues.map((issue) => `- ${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid environment variables:\n${lines.join("\n")}`);
  }
  const env = result.data;
  return {
    ...env,
    // The executor listens on IPv4 loopback only, so the default must not be "localhost"
    EXECUTE_URL: env.EXECUTE_URL ?? `http://127.0.0.1:${env.PORT_STATUS}/api/execute`,
  };
}
