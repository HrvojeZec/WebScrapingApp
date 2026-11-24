import { loadEnv, type Env } from "./env";

function loadOrExit(): Env {
  try {
    return loadEnv();
  } catch (error) {
    // Fail at startup with the list of bad variables instead of a vague error on the first request
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export const env = loadOrExit();
export type { Env };
