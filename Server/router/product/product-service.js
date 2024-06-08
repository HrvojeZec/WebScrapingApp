const Store = require("../../model/storesModel");
const Product = require("../../model/productModel");
const Scrape = require("../../model/scrapeModel");

const paginationHandler = async (keyword, page, pageSize) => {
  const existingProducts = await Product.find({ keyword });
  const dataLength = existingProducts.length;

  const totalPages = Math.ceil(dataLength / pageSize);
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  return { totalPages, skip, limit };
};

const findProductsByKeyword = async (keyword, skip, limit) => {
  const existingProducts = await Product.find({ keyword })
    .skip(skip)
    .limit(limit);

  let result = [];

  if (existingProducts.length > 0) {
    for (const product of existingProducts) {
      const store = await Store.findById(product.storeId);
      if (store) {
        const productWithStoreAttributes = {
          ...product._doc,
          storeName: store.storeName,
          logo: store.logo,
        };
        result.push(productWithStoreAttributes);
      }
    }
  }
  return result;
};

const findAllProducts = async () => {
  const existingProducts = await Product.find();
  let result = [];
  for (const product of existingProducts) {
    const store = await Store.findById(product.storeId);
    if (store) {
      const productWithStoreAttributes = {
        ...product._doc,
        storeName: store.storeName,
        logo: store.logo,
      };
      result.push(productWithStoreAttributes);
    }
  }
  return result;
};

const findRandomProducts = async () => {
  const result = await Product.aggregate([{ $sample: { size: 10 } }]);
  return result;
};

const findAllKeywords = async () => {
  const result = await Product.distinct("keyword");
  return result;
};

const findProductsByScrapeId = async (scrapeId) => {
  const existingProducts = await Product.find({ scrapeId });
  console.log(existingProducts);
  let result = [];
  if (existingProducts.length > 0) {
    for (const product of existingProducts) {
      const store = await Store.findById(product.storeId);
      if (store) {
        const productWithStoreAttributes = {
          ...product._doc,
          storeName: store.storeName,
          logo: store.logo,
        };
        result.push(productWithStoreAttributes);
      }
    }
  }
  return result;
};
module.exports = {
  findAllKeywords,
  findProductsByKeyword,
  findAllProducts,
  findRandomProducts,
  findProductsByScrapeId,
  paginationHandler,
};
