import { Stores } from '../../model/storesModel';
import { Product } from '../../model/productModel';

export const paginationHandler = async (
  keyword: string,
  page: number,
  pageSize: number,
) => {
  const existingProducts = await Product.find({ keyword });
  const dataLength = existingProducts.length;

  const totalPages = Math.ceil(dataLength / pageSize);
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  return { totalPages, skip, limit };
};

export const findProductsByKeyword = async (
  keyword: string,
  skip: number,
  limit: number,
) => {
  const existingProducts = await Product.find({ keyword })
    .skip(skip)
    .limit(limit);

  const result = [];

  if (existingProducts.length > 0) {
    for (const product of existingProducts) {
      const store = await Stores.findById(product.storeId);
      if (store) {
        const productWithStoreAttributes = {
          ...product.toObject(),
          storeName: store.storeName,
          logo: store.logo,
        };
        result.push(productWithStoreAttributes);
      }
    }
  }
  return result;
};

export const findAllProducts = async () => {
  const existingProducts = await Product.find();
  const result = [];
  for (const product of existingProducts) {
    const store = await Stores.findById(product.storeId);
    if (store) {
      const productWithStoreAttributes = {
        ...product.toObject(),
        storeName: store.storeName,
        logo: store.logo,
      };
      result.push(productWithStoreAttributes);
    }
  }
  return result;
};

export const findRandomProducts = async () => {
  const result = await Product.aggregate([{ $sample: { size: 10 } }]);
  return result;
};

export const findAllKeywords = async () => {
  const result = await Product.distinct('keyword');
  return result;
};

export const findProductsByScrapeId = async (scrapeId: string) => {
  const existingProducts = await Product.find({ scrapeId });
  console.log(existingProducts);
  const result = [];
  if (existingProducts.length > 0) {
    for (const product of existingProducts) {
      const store = await Stores.findById(product.storeId);
      if (store) {
        const productWithStoreAttributes = {
          ...product.toObject(),
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
