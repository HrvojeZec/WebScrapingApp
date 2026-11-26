import { useQuery } from "@tanstack/react-query";
import { productDetailQuery } from "../api/queries";

/** A product with its price insight and the same and similar products in other stores. */
export const useProductDetail = (id: string) => useQuery(productDetailQuery(id));
