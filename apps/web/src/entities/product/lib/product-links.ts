import type { ProductDto } from "@storeseeker/shared";
import { ROUTES } from "@/shared/constants/routes";

/** Where a product leads: its page here, and its page in the store, unchanged. */
export function productLinks(product: ProductDto): { internal: string; external: string } {
  return { internal: ROUTES.product(product.id), external: product.url };
}
