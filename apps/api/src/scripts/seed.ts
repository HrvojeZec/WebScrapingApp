import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config";
import { DEMO_DB_NAME, seedDemo } from "../seed/seed-demo";

async function main() {
  // Always the demo database, whatever the URI names, so the seed never wipes real data
  await mongoose.connect(env.MONGODB_URI, { dbName: DEMO_DB_NAME });
  try {
    const { products, pricePoints } = await seedDemo(new Date());
    console.log(`Seeded "${DEMO_DB_NAME}": ${products} products, ${pricePoints} price points.`);
    console.log(`Set MONGODB_DB_NAME=${DEMO_DB_NAME} to serve the demo data.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
