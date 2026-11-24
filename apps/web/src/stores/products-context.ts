import { createContext, useContext } from "react";
import { Product } from "../types/ProductTypes";

export interface ProductContextType {
  data: Product[] | null;
  loading: boolean;
  error: string | null;
}

export const ProductsContext = createContext<ProductContextType | undefined>(undefined);

export function useProductsData(): ProductContextType {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProductsData must be used within a ProductsContextProvider");
  }
  return context;
}
