import React, { createContext, useContext, useState } from "react";

const KeywordProductContext = createContext();

export function useKeywordProductDataContext() {
  const context = useContext(KeywordProductContext);
  if (context === undefined) {
    console.log(
      "useKeywordProductData must be used with KeywordProductProvider"
    );
  }
  return context;
}

export function KeywordDataProvider({ children }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const value = {
    data,
    loading,
    error,
    setData,
    setError,
    setLoading,
  };
  console.log("keywordData value: ", value);
  return (
    <KeywordProductContext.Provider value={value}>
      {children}
    </KeywordProductContext.Provider>
  );
}
