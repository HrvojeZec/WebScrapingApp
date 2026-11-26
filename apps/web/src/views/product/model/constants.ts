export const PRODUCT_TEXT = {
  historyHeading: "Povijest cijene",
  /** Under the chart heading; the window is LIMITS.historyDaysDefault */
  historyWindow: (days: number) => `Zadnjih ${days} dana, po danu kad je cijena viđena`,
  cheapest: "Najniža cijena",
  notFoundTitle: "Ovaj proizvod ne postoji ili je uklonjen",
  notFoundText:
    "Poveznica je možda zastarjela ili ga trgovina više ne prodaje. Potraži ga u pretrazi.",
  toSearch: "Na pretragu",
} as const;
