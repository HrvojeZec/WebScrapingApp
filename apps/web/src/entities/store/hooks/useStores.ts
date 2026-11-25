import { useQuery } from "@tanstack/react-query";
import { storesQuery } from "../api/queries";

/** The enabled stores with their last crawl. */
export const useStores = () => useQuery(storesQuery());
