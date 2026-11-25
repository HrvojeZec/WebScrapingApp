export const suggestionKeys = {
  all: ["suggestions"] as const,
  term: (term: string) => [...suggestionKeys.all, term] as const,
};
