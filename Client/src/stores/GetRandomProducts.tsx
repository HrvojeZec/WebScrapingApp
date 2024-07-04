import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { constants } from "../config/constants";
import { Product } from "../lib/ProductTypes";

interface Props {
  children: React.ReactNode;
}

interface ProductContextType {
  data: Product[] | null;
  loading: boolean;
  error: string | null;
}

const ProductsContext = createContext<ProductContextType | undefined>(
  undefined
);

export function useProductsData(): ProductContextType {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error(
      "useProductsData must be used within a ProductsContextProvider"
    );
  }
  return context;
}

export function GetRandomProductsProvider(props: PropsWithChildren<Props>) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Product[] | null>(null);

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

  const value: ProductContextType = {
    data,
    loading,
    error,
  };
  console.log("RandomProducts value:", value);
  return (
    <ProductsContext.Provider value={value}>
      {props.children}
    </ProductsContext.Provider>
  );
}
