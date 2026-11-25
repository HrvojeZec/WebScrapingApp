import "dotenv/config";
import mongoose from "mongoose";
import { shopSlugSchema } from "@storeseeker/shared";
import { env } from "../config";
import { Meta } from "../db/models/meta";
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

  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  try {
    if (await Meta.exists({ _id: "dataset", demo: true })) {
      console.error("store:set does not write to the demo database.");
      process.exitCode = 1;
      return;
    }
    // The API no longer adds the shops, so a fresh database gets them here
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
