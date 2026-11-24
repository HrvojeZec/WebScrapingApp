import { Stores, IStore } from "../../model/storesModel";
import { StoresData } from "../../bootstrap/setup";

export const createStoreData = async () => {
  const stores: IStore[] = await Stores.find();
  const existingStoreNames: string[] = stores
    .map((store) => store.storeName)
    .filter((name): name is string => !!name);
  const newStoreNames = StoresData.map((data) => data.storeName).filter(
    (name) => !existingStoreNames.includes(name),
  );

  if (newStoreNames.length > 0) {
    const newStores = StoresData.filter((data) => newStoreNames.includes(data.storeName));
    await Stores.insertMany(newStores);
    console.log("New stores added to the database: ", newStoreNames);
  } else {
    console.log("No new stores added to the database.");
  }
};
