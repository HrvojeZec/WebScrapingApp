import type { StoreSlug } from "@storeseeker/shared";
import { Store, type StoreFields } from "./models/store";

type StoreSeed = Omit<StoreFields, "enabled">;

export const STORES: StoreSeed[] = [
  { slug: "harveynorman", name: "Harvey Norman", baseUrl: "https://www.harveynorman.hr" },
];

export async function ensureStores(stores: StoreSeed[] = STORES): Promise<void> {
  await Store.bulkWrite(
    stores.map((store) => ({
      updateOne: {
        filter: { slug: store.slug },
        // enabled only on insert: a store switched off by hand must stay off after a restart
        update: { $set: store, $setOnInsert: { enabled: true } },
        upsert: true,
      },
    })),
  );
}

export async function setStoreEnabled(slug: StoreSlug, enabled: boolean): Promise<void> {
  const result = await Store.updateOne({ slug }, { $set: { enabled } });
  if (result.matchedCount === 0) throw new Error(`Store "${slug}" is not in the database`);
}
