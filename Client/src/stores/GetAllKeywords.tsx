import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { constants } from "../config/constants";

interface Props {
  children: React.ReactNode;
}

interface KeywordContextType {
  data: string[] | null;
  error: boolean;
  loading: boolean;
}
const KeywordsContext = createContext<KeywordContextType | undefined>(
  undefined
);

export function useKeywordsData(): KeywordContextType {
  const context = useContext(KeywordsContext);
  if (context === undefined) {
    throw new Error(
      "useKeywordsContext must be used with GetAllKeywordsProvider"
    );
  }
  return context;
}

export function GetAllKeywordsProvider(props: PropsWithChildren<Props>) {
  const [data, setData] = useState<string[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log("useeffect");
    fetch(`${constants.apiUrl}/api/products/allKeywords`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  const value: KeywordContextType = {
    data,
    loading,
    error,
  };
  console.log("allKeywords: ", value);
  return (
    <KeywordsContext.Provider value={value}>
      {props.children}
    </KeywordsContext.Provider>
  );
}
