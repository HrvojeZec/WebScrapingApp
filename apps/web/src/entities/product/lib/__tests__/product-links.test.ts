import type { ProductDto } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { ROUTES } from "@/shared/constants/routes";
import { productLinks } from "../product-links";

const product = {
  id: "6744a1f0c2b9e1a2b3c4d5e6",
  url: "https://www.harveynorman.hr/slusalice/sony-wh-1000xm5?utm=x&ref=1",
} as ProductDto;

describe("productLinks", () => {
  it("links the card to the product page and the button to the store as it is", () => {
    expect(productLinks(product)).toEqual({
      internal: ROUTES.product(product.id),
      external: product.url,
    });
  });
});
