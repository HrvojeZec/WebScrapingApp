import React, { createContext, useContext, useEffect, useState } from "react";
import { constants } from "../config/constants";

const KeywordsContext = createContext();

export function useKeywordsData() {
  const context = useContext(KeywordsContext);
  if (context === undefined) {
    console.log("useKeywordsContext must be used with GetAllKeywordsProvider");
  }
  return context;
}

export function GetAllKeywordsProvider({ children }) {
  const [data, setData] = useState(null);
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
  const value = {
    data,
    loading,
    error,
  };
  console.log("allKeywords: ", value);
  return (
    <KeywordsContext.Provider value={value}>
      {children}
    </KeywordsContext.Provider>
  );
}
