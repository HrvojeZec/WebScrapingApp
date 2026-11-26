import type { ReactNode } from "react";
import { Button, Skeleton, Text, Title, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangle, IconCircleCheck, IconExternalLink } from "@tabler/icons-react";
import { motion } from "motion/react";
import type { ProductDto } from "@storeseeker/shared";
import { productLinks } from "@/entities/product/lib/product-links";
import { PRODUCT_CARD_TEXT } from "@/entities/product/model/constants";
import { productImageLayoutId } from "@/shared/lib/motion";
import { MOTION } from "@/shared/theme/motion";
import { PriceTag } from "@/shared/ui/PriceTag/PriceTag";
import { ProductImage } from "@/shared/ui/ProductImage/ProductImage";
import { StoreBadge } from "@/shared/ui/StoreBadge/StoreBadge";
import { PRODUCT_TEXT } from "../../model/constants";
import classes from "./ProductHeader.module.scss";

type Props = {
  product: ProductDto;
  /** The price insight is still loading */
  pending: boolean;
  /** Null while it loads or when it could not be loaded */
  insight: {
    note: string;
    /** From `inflatedLabel`; null when the price is not a sale */
    saleLabel: string | null;
    inflated: boolean | null;
    cheapest: boolean;
  } | null;
};

/** The product's image, name, store, price, what the sale is worth and the way to the store. */
export function ProductHeader({ product, pending, insight }: Props) {
  const links = productLinks(product);

  let saleNote: ReactNode = null;
  if (insight?.saleLabel) {
    const Icon = insight.inflated ? IconAlertTriangle : IconCircleCheck;
    saleNote = (
      <Text className={insight.inflated ? classes.inflated : classes.realSale}>
        <Icon aria-hidden className={classes.icon} />
        {insight.saleLabel}
      </Text>
    );
  }

  return (
    <div className={classes.root}>
      <motion.div
        layoutId={productImageLayoutId(product.id)}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease }}
        className={classes.media}
      >
        {/* The name is the page's heading, so the photo adds nothing for a screen reader */}
        <ProductImage src={product.imageUrl} alt="" />
      </motion.div>

      <div className={classes.body}>
        <StoreBadge name={product.storeName} />
        <Title order={1} className={classes.title}>
          {product.title}
        </Title>

        <div className={classes.price}>
          <PriceTag
            priceCents={product.priceCents}
            regularPriceCents={product.regularPriceCents}
            discountPercent={product.discountPercent}
            size="page"
          />
          {insight?.cheapest && <span className={classes.cheapest}>{PRODUCT_TEXT.cheapest}</span>}
        </div>

        {insight && (
          <div className={classes.notes}>
            <Text className={classes.note}>{insight.note}</Text>
            {saleNote}
          </div>
        )}
        {pending && <Skeleton className={classes.noteSkeleton} />}

        {!product.available && (
          <Text className={classes.unavailable}>{PRODUCT_CARD_TEXT.unavailable}</Text>
        )}

        <Button
          component="a"
          href={links.external}
          target="_blank"
          rel="noopener noreferrer"
          size="md"
          rightSection={<IconExternalLink aria-hidden className={classes.icon} />}
          className={classes.toStore}
        >
          {PRODUCT_CARD_TEXT.toStore}
          <VisuallyHidden>{PRODUCT_CARD_TEXT.newTab}</VisuallyHidden>
        </Button>
      </div>
    </div>
  );
}
