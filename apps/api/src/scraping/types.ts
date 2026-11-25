/** One product as a store adapter parses it from a category listing. */
export type ParsedProduct = {
  externalId: string;
  title: string;
  url: string;
  imageUrl: string | null;
  priceCents: number;
  regularPriceCents: number | null;
  available: boolean;
  /** Only when the listing shows it; the product page is read in #33. */
  ean?: string;
};
