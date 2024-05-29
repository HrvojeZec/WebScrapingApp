const Store = require("../../model/storesModel");
const Product = require("../../model/productModel");

const findProductsByKeyword = async (keyword) => {
  const existingProducts = await Product.find({ keyword });
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
  console.log(result);
  return result;
};
module.exports = {
  findAllKeywords,
  findProductsByKeyword,
  findAllProducts,
  findRandomProducts,
};
