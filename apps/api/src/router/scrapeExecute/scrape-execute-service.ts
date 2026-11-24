const { mallScraping } = require('../../controller/scrape/scrapeMALL');
const { ekupiScraping } = require('../../controller/scrape/scrapeEkupi');

const {
  sanctaDomenicaScraping,
} = require('../../controller/scrape/scrapeSanctaDomenica');
import { log } from 'console';
import { Product, IProduct } from '../../model/productModel';
import { Stores, IStore } from '../../model/storesModel';
import { Keyword } from '../../types/params';
import mongoose from 'mongoose';

const updateProductsPrice = async (
  existingProducts: IProduct[],
  allNewProducts: IProduct[],
  scrapeId: mongoose.Types.ObjectId,
) => {
  for (const newProduct of allNewProducts) {
    const existingProduct = existingProducts.find(
      (product: IProduct) =>
        product.productId === newProduct.productId &&
        product.storeId === newProduct.storeId,
    );
    console.log(existingProduct);

    if (existingProduct && existingProduct.price !== newProduct.price) {
      await Product.updateOne(
        { _id: existingProduct._id },
        {
          $set: {
            price: newProduct.price,
            oldPrice: existingProduct.price,
            scrapeId: scrapeId,
            updateAt: new Date(),
          },
        },
      );
    }
  }
};

const addNewProducts = async (
  allNewProducts: IProduct[],
  existingProducts: IProduct[],
) => {
  const filteredProducts = allNewProducts.filter(
    (newProduct: IProduct) =>
      !existingProducts.some(
        (product: IProduct) => product.productId === newProduct.productId,
      ),
  );

  if (filteredProducts.length > 0) {
    await Product.insertMany(filteredProducts);
  }
};

const executeService = async (keyword: Keyword, newScrapingJob: any) => {
  const scrapeId: mongoose.Types.ObjectId = newScrapingJob._id;

  const mallDataPromise = mallScraping(keyword, scrapeId);
  const sanctaDomenicaDataPromise = sanctaDomenicaScraping(keyword, scrapeId);
  /*   const eKupiDataPromise = ekupiScraping(keyword, scrapeId); */
  const promises = [
    mallDataPromise,
    sanctaDomenicaDataPromise,
    /*     eKupiDataPromise, */
  ];
  const results = await Promise.allSettled(promises);
  console.log(results);

  const allNewProducts: IProduct[] = [];
  const errors = [];

  const isArrayEmpty = results.every(
    (result) => result.status === 'fulfilled' && result.value.length === 0,
  );
  console.log('isArrayEmpty', isArrayEmpty);
  if (isArrayEmpty) {
    throw { status: 404 };
  }

  // Prikupljanje svih novih proizvoda
  for (const [index, result] of results.entries()) {
    if (result.status === 'rejected') {
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
          reason: 'Invalid data format',
        });
      }
    }
  }

  /*   if (allNewProducts.length > 0) {
    const existingProducts: IProduct[] = await Product.find();
    if (existingProducts.length === 0) {
      // Ako nema postojećih proizvoda, dodaj sve nove
      await Product.insertMany(allNewProducts);
    } else {
      // Ažuriraj cijene postojećih proizvoda
      await updateProductsPrice(existingProducts, allNewProducts, scrapeId);
      // Dodaj novih proizvoda koji još ne postoje
      await addNewProducts(allNewProducts, existingProducts);
    }
  } */
  if (allNewProducts.length > 0) {
    await Product.deleteMany({ keyword });
    await Product.insertMany(allNewProducts);
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

  if (errors.length > 0) {
    throw { products: productsWithStoreAttributes, errors };
  }

  // Dodaj proizvoda (ako su novi)
  console.log('broj scrapanih proizvoda: ', productsWithStoreAttributes.length);

  return productsWithStoreAttributes;
};

module.exports = executeService;
