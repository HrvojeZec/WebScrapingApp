import { useQuery } from "@tanstack/react-query";
import { metaQuery } from "../api/queries";

/** Whether the API serves demo data, and when it was seeded. */
export const useMeta = () => useQuery(metaQuery());
