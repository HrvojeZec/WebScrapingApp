import React, { createContext, useContext, useEffect, useState } from "react";
import { constants } from "../config/constants";

const ProductsContext = createContext();

export function useProductsData() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    console.log("useProductsData must be used with ProductsContext");
  }
  return context;
}

export function GetAllProductsProvider({ children }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${constants.apiUrl}/api/products`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  const value = {
    data,
    loading,
    error,
  };
  console.log("AllProducts value:", value);
  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}
