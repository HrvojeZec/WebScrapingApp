const { mallScraping } = require("../scrape/scrapeMALL");
const { sanctaDomenicaScraping } = require("../scrape/scrapeSanctaDomenica");
const Product = require("../../model/productModel");
const Store = require("../../model/productModel");

const updateProductsPrice = async (existingProducts, newProducts) => {
  for (const newProduct of newProducts) {
    const existingProdcut = existingProducts.find(
      (product) => product.productId === newProduct.productId
    );
    if (existingProdcut && existingProdcut.price !== newProduct.price) {
      await Product.updateOne(
        { _id: existingProdcut._id },
        { $set: { price: newProduct.price } }
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

const productController = async () => {
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
          ...product,
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

module.exports = { productController, findProductsByKeyword };
