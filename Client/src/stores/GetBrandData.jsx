import React, { createContext, useContext, useEffect, useState } from "react";

const BrandContext = createContext();

export function useBrandData() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    console.log("useBrandData must be use with BrandProvider");
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
    fetch("http://localhost:5000/api/brandData/getAll")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
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
