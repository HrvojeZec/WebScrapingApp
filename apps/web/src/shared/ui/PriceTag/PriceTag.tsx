import { VisuallyHidden } from "@mantine/core";
import { formatDiscount, formatPrice } from "@/shared/lib/format";
import { isOnSale } from "@/shared/lib/price";
import classes from "./PriceTag.module.scss";

interface PriceTagProps {
  priceCents: number;
  regularPriceCents: number | null;
  discountPercent: number;
  /** 25 px on a product card, 39 px on the product page */
  size: "card" | "page";
}

/** The price as a shelf label: flat left edge, yellow with the discount and the old price on sale. */
export function PriceTag({ priceCents, regularPriceCents, discountPercent, size }: PriceTagProps) {
  const onSale = isOnSale(priceCents, regularPriceCents) && regularPriceCents !== null;
  const className = [classes.root, classes[size], onSale && classes.sale].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <span className={classes.main}>
        <VisuallyHidden>{onSale ? "Cijena na sniženju: " : "Cijena: "}</VisuallyHidden>
        {formatPrice(priceCents)}
        {onSale && <span className={classes.discount}>{formatDiscount(discountPercent)}</span>}
      </span>
      {onSale && (
        <s className={classes.regular}>
          <VisuallyHidden>Redovna cijena: </VisuallyHidden>
          {formatPrice(regularPriceCents)}
        </s>
      )}
    </div>
  );
}
