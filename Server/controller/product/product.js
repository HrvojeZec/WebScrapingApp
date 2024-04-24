const { mallScraping } = require("../scrape/scrapeMALL");
const { sanctaDomenicaScraping } = require("../scrape/scrapeSanctaDomenica");
const Product = require("../../model/productModel");

const updateProtuctsPrice = async (existingProducts, newProducts) => {
  for (const newProduct of newProducts) {
    const existingProdcut = existingProducts.find(
      (product) => product.name === newProduct.name
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
      !existingProducts.some((product) => product.name === newProduct.name)
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
        updateProtuctsPrice(existingProducts, newProducts);
        addNewProducts(newProducts, existingProducts);
      }
    }
  });
};

const findProuctsByKeyword = async (keyword) => {
  try {
    const existingProducts = await Product.find();
    const result = existingProducts.filter((product) => {
      return product.keyword === keyword;
    });
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { productController, findProuctsByKeyword };
