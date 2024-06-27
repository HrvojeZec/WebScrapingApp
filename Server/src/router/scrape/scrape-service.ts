const { mallScraping } = require("../../controller/scrape/scrapeMALL");
const {
  sanctaDomenicaScraping,
} = require("../../controller/scrape/scrapeSanctaDomenica");
import {Product,IProduct} from "../../model/productModel";
import {Stores,IStore} from "../../model/storesModel";
import {Scrape} from "../../model/scrapeModel";
import { keyword } from "../../types/params";
import mongoose from "mongoose";



const updateProductsPrice = async (
  existingProducts:IProduct[],
  allNewProducts:IProduct[],
  scrapeId: mongoose.Types.ObjectId
) => {
  for (const newProduct of allNewProducts) {
    const existingProduct = existingProducts.find(
      (product:IProduct) =>
        product.productId === newProduct.productId &&
        product.storeId === newProduct.storeId
    );
    if (existingProduct && existingProduct.price !== newProduct.price) {
      await Product.updateOne(
        { _id: existingProduct._id },
        {
          $set: {
            price: newProduct.price,
            oldPrice: existingProduct.price,
            scrapeId: scrapeId,
            new: true,
          },
        }
      );
    }
  }
};

const addNewProducts = async (allNewProducts:IProduct[], existingProducts:IProduct[]) => {
  const filteredProducts = allNewProducts.filter(
    (newProduct:IProduct) =>
      !existingProducts.some(
        (product:IProduct) => product.productId === newProduct.productId
      )
  );

  if (filteredProducts.length > 0) {
    await Product.insertMany(filteredProducts);
  }
};

const executeService = async (keyword: keyword) => {
  const newScrapingJob = new Scrape({
    status: "started",
    startTime: new Date(),
    keyword: keyword,
  });
  await newScrapingJob.save();
  const scrapeId = newScrapingJob._id;

  const mallDataPromise = mallScraping(keyword, scrapeId);
  const sanctaDomenicaDataPromise = sanctaDomenicaScraping(keyword, scrapeId);
  const promises = [mallDataPromise, sanctaDomenicaDataPromise];
  const results = await Promise.allSettled(promises);

  let allNewProducts: IProduct[] = [];
  const errors = [];

  const isArrayEmpty = results.every(
    (result) => result.status === "fulfilled" && result.value.length === 0
  );
  console.log("isArrayEmpty", isArrayEmpty);
  if (isArrayEmpty) {
    throw { status: 404 };
  }
  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      errors.push({
        functionName: `Function${index + 1}`,
        reason: result.reason,
      });
    } else {
      const newProducts = Array.isArray(result.value)
        ? result.value
        : result.value.data;
      if (Array.isArray(newProducts)) {
        allNewProducts.push(...newProducts);
      } else {
        errors.push({
          functionName: `Function${index + 1}`,
          reason: "Invalid data format",
        });
      }
    }
  }

  if (allNewProducts.length > 0) {
    const existingProducts:IProduct[] = await Product.find();
    if (existingProducts.length === 0) {
      await Product.insertMany(allNewProducts);
    } else {
      await updateProductsPrice(existingProducts, allNewProducts, scrapeId);
      await addNewProducts(allNewProducts, existingProducts);
    }
  }

  const productsWithStoreAttributes = [];
  for (const product of allNewProducts) {
    const storeData = await Stores.findById<IStore>(product.storeId);
    if (storeData) {
      const productWithStoreAttributes = {
        ...product,
        storeName: storeData.storeName,
        logo: storeData.logo,
      };
      productsWithStoreAttributes.push(productWithStoreAttributes);
    }
  }
  newScrapingJob.status = "finished";
  newScrapingJob.endTime = new Date();
  await newScrapingJob.save();

  if (errors.length > 0) {
    throw { products: productsWithStoreAttributes, errors };
  }

  return productsWithStoreAttributes;
};

module.exports = executeService;
