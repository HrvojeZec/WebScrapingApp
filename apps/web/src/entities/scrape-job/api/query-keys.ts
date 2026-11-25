export const scrapeKeys = {
  all: ["scrapes"] as const,
  job: (id: string | null) => [...scrapeKeys.all, id] as const,
};
