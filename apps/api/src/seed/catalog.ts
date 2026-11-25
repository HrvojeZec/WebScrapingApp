import type { CategorySlug } from "@storeseeker/shared";

export type CatalogModel = { title: string; basePriceCents: number };

// Made-up brands only: the demo must never look like data about a real company's products
export const DEMO_CATALOG: Record<CategorySlug, CatalogModel[]> = {
  mobiteli: [
    { title: "Nordvik Aero 6 128 GB", basePriceCents: 39_999 },
    { title: "Nordvik Aero 6 Pro 256 GB", basePriceCents: 64_999 },
    { title: "Lumora Pixa S 128 GB", basePriceCents: 29_999 },
    { title: "Lumora Pixa Ultra 512 GB", basePriceCents: 99_999 },
    { title: "Brevix One Lite 64 GB", basePriceCents: 17_999 },
    { title: "Brevix One 5G 128 GB", basePriceCents: 24_999 },
    { title: "Quella Fold Z 256 GB", basePriceCents: 129_999 },
    { title: "Tavio Note 12 128 GB", basePriceCents: 21_999 },
  ],
  laptopi: [
    { title: "Lumora Book 14 i5 16 GB 512 GB SSD", basePriceCents: 79_999 },
    { title: "Lumora Book 16 i7 32 GB 1 TB SSD", basePriceCents: 129_999 },
    { title: "Nordvik Slate 13 R5 8 GB 256 GB SSD", basePriceCents: 54_999 },
    { title: "Nordvik Slate 15 R7 16 GB 512 GB SSD", basePriceCents: 84_999 },
    { title: "Brevix Forge G15 gaming i7 RTX", basePriceCents: 149_999 },
    { title: "Quella Air 14 OLED 16 GB", basePriceCents: 109_999 },
    { title: "Tavio Study 15 Celeron 8 GB", basePriceCents: 34_999 },
    { title: "Tavio Work 14 i5 16 GB", basePriceCents: 69_999 },
  ],
  televizori: [
    { title: 'Brevix Vista 43" 4K LED', basePriceCents: 32_999 },
    { title: 'Brevix Vista 55" 4K QLED', basePriceCents: 59_999 },
    { title: 'Brevix Vista 65" 4K QLED', basePriceCents: 89_999 },
    { title: 'Lumora Cinema 55" OLED', basePriceCents: 119_999 },
    { title: 'Lumora Cinema 65" OLED', basePriceCents: 179_999 },
    { title: 'Nordvik Frame 50" 4K LED', basePriceCents: 44_999 },
    { title: 'Tavio Home 32" HD LED', basePriceCents: 17_999 },
    { title: 'Quella Ambient 75" Mini LED', basePriceCents: 199_999 },
  ],
  tableti: [
    { title: 'Quella Tab 11" 128 GB Wi-Fi', basePriceCents: 34_999 },
    { title: 'Quella Tab 13" Pro 256 GB', basePriceCents: 79_999 },
    { title: 'Nordvik Pad 10" 64 GB', basePriceCents: 19_999 },
    { title: 'Nordvik Pad 12" 128 GB LTE', basePriceCents: 39_999 },
    { title: 'Lumora Canvas 11" 128 GB', basePriceCents: 44_999 },
    { title: 'Brevix Kids 8" 32 GB', basePriceCents: 12_999 },
    { title: 'Tavio Tab 10" 64 GB', basePriceCents: 16_999 },
    { title: 'Tavio Tab 11" Plus 128 GB', basePriceCents: 24_999 },
  ],
  slusalice: [
    { title: "Tavio Pulse ANC bežične slušalice", basePriceCents: 14_999 },
    { title: "Tavio Buds 3 bežične slušalice", basePriceCents: 7_999 },
    { title: "Nordvik Echo Pro naglavne slušalice", basePriceCents: 24_999 },
    { title: "Nordvik Echo Lite naglavne slušalice", basePriceCents: 9_999 },
    { title: "Lumora Studio žičane slušalice", basePriceCents: 12_999 },
    { title: "Brevix Sport bežične slušalice", basePriceCents: 5_999 },
    { title: "Quella Buds Pro ANC", basePriceCents: 19_999 },
    { title: "Quella Gaming Headset 7.1", basePriceCents: 8_999 },
  ],
};
