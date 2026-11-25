import { createContext, useContext } from "react";

export interface KeywordContextType {
  data: string[] | null;
  error: boolean;
  loading: boolean;
}

export const KeywordsContext = createContext<KeywordContextType | undefined>(undefined);

export function useKeywordsData(): KeywordContextType {
  const context = useContext(KeywordsContext);
  if (context === undefined) {
    throw new Error("useKeywordsContext must be used with GetAllKeywordsProvider");
  }
  return context;
}
