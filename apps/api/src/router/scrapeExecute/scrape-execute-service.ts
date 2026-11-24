import { mallScraping } from "../../controller/scrape/scrapeMALL";
import { sanctaDomenicaScraping } from "../../controller/scrape/scrapeSanctaDomenica";
import { Product } from "../../model/productModel";
import { Stores, IStore } from "../../model/storesModel";

type ScrapedProduct = Awaited<
  ReturnType<typeof mallScraping | typeof sanctaDomenicaScraping>
>[number];

// newScrapingJob arrives as JSON from the public API, so its _id is a string
const executeService = async (keyword: string, newScrapingJob: { _id: string }) => {
  const scrapeId = newScrapingJob._id;

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

  const allNewProducts: ScrapedProduct[] = [];
  const errors = [];

  const isArrayEmpty = results.every(
    (result) => result.status === "fulfilled" && result.value.length === 0,
  );
  console.log("isArrayEmpty", isArrayEmpty);
  if (isArrayEmpty) {
    throw { status: 404 };
  }

  // Prikupljanje svih novih proizvoda
  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      errors.push({
        functionName: `Function${index + 1}`,
        reason: result.reason,
      });
    } else {
      allNewProducts.push(...result.value);
    }
  }

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
  console.log("broj scrapanih proizvoda: ", productsWithStoreAttributes.length);

  return productsWithStoreAttributes;
};

export default executeService;
