import React, { createContext, useContext, useEffect, useState } from "react";
import { constants } from "../config/constants";

const ProductsContext = createContext(undefined);

export function useProductsData() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    console.log("useProductsData must be used with ProductsContext");
  }
  return context;
}

export function GetRandomProductsProvider({ children }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchRandomProducts = async () => {
    setLoading(true);
    await fetch(`${constants.apiUrl}/api/products/randomProducts`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRandomProducts();
    const interval = setInterval(() => {
      fetchRandomProducts();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    data,
    loading,
    error,
  };
  console.log("RandomProducts value:", value);
  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}
