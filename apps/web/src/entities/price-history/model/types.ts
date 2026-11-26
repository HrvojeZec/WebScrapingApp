/** One point of the price chart: a time in ms and the price in euros. */
export type ChartPoint = { date: number; price: number };

export type PriceHistoryNote = { kind: "lowest30d" | "historySince"; text: string };
