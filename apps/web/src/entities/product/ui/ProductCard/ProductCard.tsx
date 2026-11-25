import type { ReactNode } from "react";
import { Button, Text, VisuallyHidden } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import type { ProductDto } from "@storeseeker/shared";
import { productImageLayoutId } from "@/shared/lib/motion";
import { GlowCard } from "@/shared/ui/motion/GlowCard/GlowCard";
import { PriceTag } from "@/shared/ui/PriceTag/PriceTag";
import { ProductImage } from "@/shared/ui/ProductImage/ProductImage";
import { StoreBadge } from "@/shared/ui/StoreBadge/StoreBadge";
import { productLinks } from "../../lib/product-links";
import { PRODUCT_CARD_TEXT } from "../../model/constants";
import classes from "./ProductCard.module.scss";

type Props = {
  product: ProductDto;
  /** 3 under a section heading, 2 right under the page's h1 */
  headingOrder?: 2 | 3;
  /** Shown over the corner of the image, e.g. the discount of a deal */
  badge?: ReactNode;
};

/** A product in a grid: the whole card opens its page, the button opens the store in a new tab. */
export function ProductCard({ product, headingOrder = 3, badge }: Props) {
  const links = productLinks(product);
  const Heading = headingOrder === 2 ? "h2" : "h3";

  return (
    <GlowCard className={classes.card}>
      <motion.div layoutId={productImageLayoutId(product.id)} className={classes.media}>
        {/* The name is right below, so the photo adds nothing for a screen reader */}
        <ProductImage src={product.imageUrl} alt="" />
      </motion.div>
      {badge && <div className={classes.badge}>{badge}</div>}
      <div className={classes.body}>
        <StoreBadge name={product.storeName} />
        <Heading className={classes.title}>
          <Link to={links.internal} className={classes.link}>
            {product.title}
          </Link>
        </Heading>
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
        <Button
          component="a"
          href={links.external}
          target="_blank"
          rel="noopener noreferrer"
          variant="default"
          size="sm"
          fullWidth
          rightSection={<IconExternalLink aria-hidden className={classes.icon} />}
          className={classes.toStore}
          classNames={{ label: classes.toStoreLabel }}
        >
          {PRODUCT_CARD_TEXT.toStore}
          <VisuallyHidden>{PRODUCT_CARD_TEXT.newTab}</VisuallyHidden>
        </Button>
      </div>
    </GlowCard>
  );
}
