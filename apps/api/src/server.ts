import "dotenv/config";
import { env } from "./config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const scrapeRoute = require("./router/scrape/scrape-router");
const scrapeExecuteRouter = require("./router/scrapeExecute/scrape-execute-router");
const scrapeStatusRouter = require("./router/scrapeStatus/scrapeStatus-router");
const productRouter = require("./router/product/product-router");
const globalErrorhandler = require("./controller/error/errorController");
const { createStoreData } = require("./router/store/stores-service");

const app = express();
const scrapeApp = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

scrapeApp.use(express.json());
scrapeApp.use(express.urlencoded({ extended: true }));

scrapeApp.use("/api/execute", scrapeExecuteRouter); // bavi se izvođenjem scrapanja na portu 5001 i salje rezultate u bazu
app.use("/api/status", scrapeStatusRouter); // bavi se provjerom statusa scrapanja
app.use("/api/scrape", scrapeRoute); // pokreće scrapanje i vraća scrapeId
app.use("/api/products", productRouter);
app.use(globalErrorhandler);

async function start() {
  // Connect first, so the API never accepts requests it cannot serve
  try {
    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    console.error("Could not connect to MongoDB:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
  console.log("Database is connected");
  await createStoreData();

  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });

  // The executor has no authentication, so only processes on this machine may reach it
  scrapeApp.listen(env.PORT_STATUS, "127.0.0.1", () => {
    console.log(`Executor listening on 127.0.0.1:${env.PORT_STATUS}`);
  });
}

start().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});
