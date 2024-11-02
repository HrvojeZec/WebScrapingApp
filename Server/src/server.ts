import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
require('dotenv').config();

const scrapeRoute = require('./router/scrape/scrape-router');
const storeRouter = require('./router/store/stores-router');
const productRouter = require('./router/product/product-router');
const globalErrorhandler = require('./controller/error/errorController');
const { createStoreData } = require('./router/store/stores-service');

const app = express();
const port = process.env.PORT;

const app1 = express();
const statusPORT = process.env.PORT_STATUS;

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/scrape', scrapeRoute);
app.use('/api/storeData', storeRouter);
app.use('/api/products', productRouter);
app.use(globalErrorhandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

mongoose
  .connect(
    `mongodb+srv://hrvojezec99:${process.env.MONGODB_PASSWORD}@cluster0.pkwobu1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
  )
  .then(() => {
    console.log('Database is connected');
    createStoreData();
  })
  .catch((err: string) => {
    console.log(err);
  });
