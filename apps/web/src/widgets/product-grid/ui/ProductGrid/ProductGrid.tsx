import { Pagination, SimpleGrid, Skeleton } from "@mantine/core";
import { motion } from "motion/react";
import type { ProductDto } from "@storeseeker/shared";
import { ProductCard } from "@/entities/product/ui/ProductCard/ProductCard";
import { UI } from "@/shared/constants/ui";
import { MOTION } from "@/shared/theme/motion";
import { pageCount } from "../../lib/page-count";
import { GRID_TEXT, SKELETON_CARDS } from "../../model/constants";
import classes from "./ProductGrid.module.scss";

type Props = {
  items: ProductDto[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** The first page is still loading: placeholder cards */
  loading?: boolean;
  /** An older page is shown while the next one loads */
  busy?: boolean;
};

/** Cards of equal height, 4, 3 or 2 in a row, with pages under them. */
export function ProductGrid({ items, total, page, pageSize, onPageChange, loading, busy }: Props) {
  const pages = pageCount(total, pageSize);

  return (
    <div className={classes.root}>
      <SimpleGrid
        cols={UI.productGridColumns}
        className={busy ? `${classes.grid} ${classes.busy}` : classes.grid}
        aria-busy={loading || busy}
      >
        {loading
          ? Array.from({ length: SKELETON_CARDS }, (_, index) => (
              <Skeleton key={index} className={classes.skeleton} />
            ))
          : items.map((product) => (
              // The whole card moves to its new place on a new sort, so the image (layoutId)
              // never flies on its own; MotionConfig turns this off with reduced motion
              <motion.div
                key={product.id}
                layout="position"
                transition={{ duration: MOTION.duration.slow, ease: MOTION.ease }}
                className={classes.cell}
              >
                <ProductCard product={product} headingOrder={2} />
              </motion.div>
            ))}
      </SimpleGrid>
      {!loading && pages > 1 && (
        <nav aria-label={GRID_TEXT.pagination} className={classes.pagination}>
          <Pagination
            total={pages}
            value={page}
            onChange={onPageChange}
            getItemProps={(item) => ({ "aria-label": `${GRID_TEXT.page} ${item}` })}
            getControlProps={(control) => {
              if (control === "previous") return { "aria-label": GRID_TEXT.previous };
              if (control === "next") return { "aria-label": GRID_TEXT.next };
              return {};
            }}
          />
        </nav>
      )}
    </div>
  );
}
