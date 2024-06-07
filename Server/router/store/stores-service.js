const Stores = require("../../model/storesModel");
const { StoresData } = require("../../boostrap/setup");
const addStore = async ({ storeName }) => {
  const existingStoreName = await Stores.findOne({ storeName: storeName });

  if (existingStoreName) {
    return { success: false, error: "STORE_ALREADY_EXISTS" };
  } else {
    const store = [{ logo: null, storeName: storeName }];
    const result = await Stores.insertMany(store);

    if (result) {
      return { success: true };
    } else {
      return { success: false, error: "INSERTION_FAILED" };
    }
  }
};

const createStoreData = async () => {
  const stores = await Stores.find();
  const existingStoreNames = stores.map((store) => store.storeName);
  const newStoreNames = StoresData.map((data) => data.storeName).filter(
    (name) => !existingStoreNames.includes(name)
  );

  if (newStoreNames.length > 0) {
    const newStores = StoresData.filter((data) =>
      newStoreNames.includes(data.storeName)
    );
    await Stores.insertMany(newStores);
    console.log("New stores added to the database: ", newStoreNames);
  } else {
    console.log("No new stores added to the database.");
  }
};
module.exports = { addStore, createStoreData };
