const Store = require("../../model/storesModel");
const Product = require("../../model/productModel");

const findProductsByKeyword = async (keyword) => {
  const existingProducts = await Product.find({ keyword: keyword });

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

    return result;
  } else {
    return {
      success: false,
      message:
        "Nema pronađenih proizvoda koji odgovaraju unesenom ključnom riječi.",
    };
  }
};

const findAllProducts = async () => {
  try {
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
  } catch (error) {
    throw error;
  }
};

module.exports = { findProductsByKeyword, findAllProducts };
