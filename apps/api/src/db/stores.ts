import type { StoreSlug } from "@storeseeker/shared";
import { Store, type StoreFields } from "./models/store";

const STORES: Omit<StoreFields, "enabled">[] = [
  { slug: "mall", name: "Mall", baseUrl: "https://www.mall.hr", logoPath: "/stores/mall.svg" },
  {
    slug: "bigbang",
    name: "Big Bang",
    baseUrl: "https://www.bigbang.hr",
    logoPath: "/stores/bigbang.svg",
  },
];

export async function ensureStores(): Promise<void> {
  await Store.bulkWrite(
    STORES.map((store) => ({
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
