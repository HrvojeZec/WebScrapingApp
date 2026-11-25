import { PropsWithChildren, useEffect, useState } from "react";
import { Product } from "./types";
import { ProductContextType, ProductsContext } from "./products-context";

interface Props {
  children: React.ReactNode;
}

export function GetRandomProductsProvider(props: PropsWithChildren<Props>) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Product[] | null>(null);

  const fetchRandomProducts = async () => {
    setLoading(true);
    await fetch(`/api/products/randomProducts`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRandomProducts();
    const interval = setInterval(
      () => {
        fetchRandomProducts();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  const value: ProductContextType = {
    data,
    loading,
    error,
  };
  console.log("RandomProducts value:", value);
  return <ProductsContext.Provider value={value}>{props.children}</ProductsContext.Provider>;
}
