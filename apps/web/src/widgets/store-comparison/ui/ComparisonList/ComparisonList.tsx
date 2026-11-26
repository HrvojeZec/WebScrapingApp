import { Text, Title } from "@mantine/core";
import { Link } from "react-router";
import type { ProductDto } from "@storeseeker/shared";
import { productLinks } from "@/entities/product/lib/product-links";
import { PRODUCT_CARD_TEXT } from "@/entities/product/model/constants";
import { PriceTag } from "@/shared/ui/PriceTag/PriceTag";
import { StoreBadge } from "@/shared/ui/StoreBadge/StoreBadge";
import { STORE_COMPARISON_TEXT } from "../../model/constants";
import classes from "./ComparisonList.module.scss";

type Props = {
  title: string;
  headingId: string;
  products: ProductDto[];
  /** Gets the "Najniža cijena" label */
  cheapestId?: string | null;
};

/** Products of other stores, each with its store, its price and a link to its page. */
export function ComparisonList({ title, headingId, products, cheapestId = null }: Props) {
  return (
    <section aria-labelledby={headingId} className={classes.section}>
      <Title order={2} id={headingId} className={classes.heading}>
        {title}
      </Title>
      <ul className={classes.list}>
        {products.map((product) => (
          <li key={product.id} className={classes.item}>
            <div className={classes.store}>
              <StoreBadge name={product.storeName} />
              {product.id === cheapestId && (
                <span className={classes.cheapest}>{STORE_COMPARISON_TEXT.cheapest}</span>
              )}
            </div>
            <Link to={productLinks(product).internal} className={classes.title}>
              {product.title}
            </Link>
            <div className={classes.price}>
              <PriceTag
                priceCents={product.priceCents}
                regularPriceCents={product.regularPriceCents}
                discountPercent={product.discountPercent}
                size="card"
              />
              {!product.available && (
                <Text className={classes.unavailable}>{PRODUCT_CARD_TEXT.unavailable}</Text>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
