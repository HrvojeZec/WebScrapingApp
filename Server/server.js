const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const scrapeRoute = require("./router/scrapeRouter");
const storeRouter = require("./router/storesRouter");

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/scrape", scrapeRoute);
app.use("/api/storeData", storeRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

mongoose
  .connect(
    `mongodb+srv://hrvojezec99:${process.env.MONGODB_PASSWORD}@cluster0.pkwobu1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log(err);
  });
