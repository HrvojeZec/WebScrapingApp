/** One product as a store adapter parses it from a search page. */
export type ParsedProduct = {
  externalId: string;
  title: string;
  url: string;
  imageUrl: string | null;
  priceCents: number;
  regularPriceCents: number | null;
  available: boolean;
};
