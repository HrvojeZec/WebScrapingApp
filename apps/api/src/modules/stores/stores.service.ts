import { Store } from "../../db/models/store";

/** slug → name of the enabled stores. Products of any other store are never shown. */
export async function enabledStores(): Promise<Map<string, string>> {
  const stores = await Store.find({ enabled: true }, { slug: 1, name: 1 }).lean();
  return new Map(stores.map((store) => [store.slug, store.name]));
}
