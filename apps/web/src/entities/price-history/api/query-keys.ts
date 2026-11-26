export const priceHistoryKeys = {
  all: ["price-history"] as const,
  product: (id: string, days: number) => [...priceHistoryKeys.all, id, days] as const,
};
