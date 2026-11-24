import { Stores, IStore } from "../../model/storesModel";
const { StoresData } = require("../../bootstrap/setup");

export const createStoreData = async () => {
  const stores: IStore[] = await Stores.find();
  const existingStoreNames: string[] = stores
    .map((store) => store.storeName)
    .filter((name): name is string => !!name);
  const newStoreNames: string[] = StoresData.map((data: IStore) => data.storeName).filter(
    (name: string) => !existingStoreNames.includes(name),
  );

  if (newStoreNames.length > 0) {
    const newStores = StoresData.filter((data: IStore) => newStoreNames.includes(data.storeName!));
    await Stores.insertMany(newStores);
    console.log("New stores added to the database: ", newStoreNames);
  } else {
    console.log("No new stores added to the database.");
  }
};
module.exports = { createStoreData };
