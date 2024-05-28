const Stores = require("../../model/storesModel");

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

module.exports = addStore;
