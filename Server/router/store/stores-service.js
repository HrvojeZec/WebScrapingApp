const Stores = require("../../model/storesModel");

const AddStore = async ({ storeName }) => {
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
      return { success: true, message: "Podatci su uspješno dodani" };
    } else {
      return {
        success: false,
        message: "Došlo je do pogreške prilikom dodavanja trgovine u bazu",
      };
    }
  }
};

module.exports = AddStore;
