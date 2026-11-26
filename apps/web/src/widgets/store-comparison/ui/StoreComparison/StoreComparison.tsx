import type { ProductDto } from "@storeseeker/shared";
import { STORE_COMPARISON_TEXT } from "../../model/constants";
import { ComparisonList } from "../ComparisonList/ComparisonList";
import classes from "./StoreComparison.module.scss";

type Props = {
  same: ProductDto[];
  similar: ProductDto[];
  /** The cheapest of this product and the same ones; see `cheapestSame` */
  cheapestId: string | null;
};

/** The same product in other stores and similar products, apart; an empty list is left out. */
export function StoreComparison({ same, similar, cheapestId }: Props) {
  if (same.length === 0 && similar.length === 0) return null;

  return (
    <div className={classes.root}>
      {same.length > 0 && (
        <ComparisonList
          title={STORE_COMPARISON_TEXT.same}
          headingId="same-products-heading"
          products={same}
          cheapestId={cheapestId}
        />
      )}
      {similar.length > 0 && (
        <ComparisonList
          title={STORE_COMPARISON_TEXT.similar}
          headingId="similar-products-heading"
          products={similar}
        />
      )}
    </div>
  );
}
