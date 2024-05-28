const Stores = require("../../model/storesModel");

const addStore = async ({ storeName }) => {
  const store = [
    {
      logo: null,
      storeName: storeName,
    },
  ];

  const existingStoreName = await Stores.findOne({ storeName: storeName });
  if (existingStoreName) {
    return {
      success: false,
      message: "trgovina je već dodana u bazu",
    };
  } else {
    const result = await Stores.insertMany(store);
    if (result) {
      return { success: true, message: "Trgovina je uspješno dodana" };
    } else {
      return {
        success: false,
        message: "Došlo je do pogreške prilikom dodavanja trgovine u bazu",
      };
    }
  }
};

module.exports = addStore;
