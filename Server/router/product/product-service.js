const Store = require("../../model/storesModel");
const Product = require("../../model/productModel");

const findProductsByKeyword = async (keyword) => {
  try {
    const existingProducts = await Product.find({ keyword: keyword });
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
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = findProductsByKeyword;
