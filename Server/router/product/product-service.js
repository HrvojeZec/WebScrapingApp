const { mallScraping } = require("../../controller/scrape/scrapeMALL");
const {
  sanctaDomenicaScraping,
} = require("../../controller/scrape/scrapeSanctaDomenica");
const Product = require("../../model/productModel");
const Store = require("../../model/storesModel");

const updateProductsPrice = async (existingProducts, newProducts) => {
  for (const newProduct of newProducts) {
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
            new: true,
          },
        }
      );
    }
  }
};

const addNewProducts = async (newProducts, existingProducts) => {
  const filteredProducts = newProducts.filter(
    (newProduct) =>
      !existingProducts.some(
        (product) => product.productId === newProduct.productId
      )
  );
  await Product.create(filteredProducts);
};

const productService = async () => {
  const mallDataPromise = mallScraping();
  const sanctaDomenicaDataPromise = sanctaDomenicaScraping();
  const promises = [mallDataPromise, sanctaDomenicaDataPromise];
  const scrapingFunctions = [mallScraping, sanctaDomenicaScraping];
  const results = await Promise.allSettled(promises);

  results.forEach(async (result, index) => {
    if (result.status === "rejected") {
      const functionName =
        scrapingFunctions[index].name || `Function${index + 1}`;
      console.error(`Promise ${functionName} rejected with ${result.reason}`);
    } else {
      const newProducts = result.value;
      const existingProducts = await Product.find();
      console.log(existingProducts.length);
      if (existingProducts.length === 0) {
        await Product.create(newProducts);
      } else {
        updateProductsPrice(existingProducts, newProducts);
        addNewProducts(newProducts, existingProducts);
      }
    }
  });
};

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
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { productService, findProductsByKeyword };
