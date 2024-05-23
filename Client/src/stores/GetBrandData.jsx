import React, { createContext, useContext, useEffect, useState } from "react";
import { constants } from "../config/constants";

const BrandContext = createContext();

export function useBrandData() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    console.log("useBrandData must be used with BrandProvider");
  }
  return context;
}

export function BrandProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useEffect called");
    setLoading(true);
    fetch(`${constants.apiUrl}/api/brandData/getAll`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => setError(true))
      .finally(() => setLoading(false));
  }, []);
  const value = {
    data,
    error,
    loading,
  };
  console.log("Brand value:", value);
  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
}
