import { Anchor, Container, SimpleGrid, Skeleton, Text, Title } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "react-router";
import { useDeals } from "@/entities/product/hooks/useDeals";
import { DEALS_HOME_LIMIT } from "@/entities/product/model/constants";
import { ProductCard } from "@/entities/product/ui/ProductCard/ProductCard";
import { ROUTES } from "@/shared/constants/routes";
import { UI } from "@/shared/constants/ui";
import { formatDiscount } from "@/shared/lib/format";
import { shownDiscount } from "@/shared/lib/price";
import { ErrorState } from "@/shared/ui/ErrorState/ErrorState";
import { AnimatedNumber } from "@/shared/ui/motion/AnimatedNumber/AnimatedNumber";
import { ShimmerText } from "@/shared/ui/motion/ShimmerText/ShimmerText";
import { DEALS_TEXT } from "../../model/constants";
import classes from "./DealsRow.module.scss";

const ALL_DEALS = ROUTES.searchWith({ discounted: true, sort: "discount" });

/** Today's biggest discounts on the home page, real sales first. */
export function DealsRow() {
  const deals = useDeals();

  return (
    <section className={classes.section} aria-labelledby="deals-heading">
      <Container>
        <div className={classes.head}>
          <Title order={2} id="deals-heading" className={classes.heading}>
            <ShimmerText>{DEALS_TEXT.heading}</ShimmerText>
          </Title>
          <Anchor component={Link} to={ALL_DEALS} className={classes.all}>
            {DEALS_TEXT.allDeals}
            <IconChevronRight aria-hidden className={classes.allIcon} />
          </Anchor>
        </div>

        {deals.isError ? (
          <ErrorState error={deals.error} onRetry={() => void deals.refetch()} titleOrder={3} />
        ) : deals.data?.items.length === 0 ? (
          <Text className={classes.empty}>{DEALS_TEXT.empty}</Text>
        ) : (
          <SimpleGrid cols={UI.productGridColumns} className={classes.grid}>
            {deals.data
              ? deals.data.items.map(({ product }) => {
                  const discount = shownDiscount(product.discountPercent);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      badge={
                        discount !== null && (
                          // The price tag says the discount to screen readers already
                          <span className={classes.discount} aria-hidden>
                            <AnimatedNumber value={discount} format={formatDiscount} />
                          </span>
                        )
                      }
                    />
                  );
                })
              : Array.from({ length: DEALS_HOME_LIMIT }, (_, index) => (
                  <Skeleton key={index} className={classes.skeleton} />
                ))}
          </SimpleGrid>
        )}
      </Container>
    </section>
  );
}
