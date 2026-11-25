import "dotenv/config";
import mongoose from "mongoose";
import { shopSlugSchema } from "@storeseeker/shared";
import { env } from "../config";
import { ensureStores, setStoreEnabled } from "../db/stores";

const USAGE = "Usage: npm run store:set -w @storeseeker/api -- <harveynorman> <on|off>";

async function main() {
  const [slugArg, stateArg] = process.argv.slice(2);
  const slug = shopSlugSchema.safeParse(slugArg);
  if (!slug.success || (stateArg !== "on" && stateArg !== "off")) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(env.MONGODB_URI);
  try {
    // A fresh database has no stores until the API first starts
    await ensureStores();
    await setStoreEnabled(slug.data, stateArg === "on");
    console.log(`Store "${slug.data}" is now ${stateArg}.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
