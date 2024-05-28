const { mallScraping } = require("../../controller/scrape/scrapeMALL");
const {
  sanctaDomenicaScraping,
} = require("../../controller/scrape/scrapeSanctaDomenica");
const Product = require("../../model/productModel");
const Store = require("../../model/storesModel");

const updateProductsPrice = async (existingProducts, allNewProducts) => {
  for (const newProduct of allNewProducts) {
    const existingProduct = existingProducts.find(
      (product) =>
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
            new: true,
          },
        }
      );
    }
  }
};

const addNewProducts = async (allNewProducts, existingProducts) => {
  const filteredProducts = allNewProducts.filter(
    (newProduct) =>
      !existingProducts.some(
        (product) => product.productId === newProduct.productId
      )
  );
  if (filteredProducts.length > 0) {
    await Product.insertMany(filteredProducts);
  }
};

const scrapeService = async (keyword) => {
  const mallDataPromise = mallScraping(keyword);
  const sanctaDomenicaDataPromise = sanctaDomenicaScraping(keyword);
  const promises = [mallDataPromise, sanctaDomenicaDataPromise];
  const results = await Promise.allSettled(promises);

  let allNewProducts = [];
  const errors = [];

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
    const existingProducts = await Product.find();
    if (existingProducts.length === 0) {
      await Product.insertMany(allNewProducts);
    } else {
      await updateProductsPrice(existingProducts, allNewProducts);
      await addNewProducts(allNewProducts, existingProducts);
    }
  }

  const productsWithStoreAttributes = [];
  for (const product of allNewProducts) {
    const storeData = await Store.findById(product.storeId);
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

  return productsWithStoreAttributes;
};

module.exports = scrapeService;
