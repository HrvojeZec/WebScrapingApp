import { lazy, Suspense, useState } from "react";
import { Container, Skeleton, Text, Title } from "@mantine/core";
import { useParams } from "react-router";
import { LIMITS } from "@storeseeker/shared";
import { toChartPoints } from "@/entities/price-history/lib/chart-points";
import { priceHistoryNote } from "@/entities/price-history/lib/history-note";
import { usePriceHistory } from "@/entities/price-history/hooks/usePriceHistory";
import { useProductDetail } from "@/entities/product/hooks/useProductDetail";
import { useProductPreview } from "@/entities/product/hooks/useProductPreview";
import { inflatedLabel } from "@/entities/product/lib/inflated-label";
import { isMissingProduct } from "@/entities/product/lib/missing-product";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ErrorState } from "@/shared/ui/ErrorState/ErrorState";
import { cheapestSame } from "@/widgets/store-comparison/lib/cheapest";
import { StoreComparison } from "@/widgets/store-comparison/ui/StoreComparison/StoreComparison";
import { PRODUCT_TEXT } from "./model/constants";
import { ProductHeader } from "./ui/ProductHeader/ProductHeader";
import { ProductNotFound } from "./ui/ProductNotFound/ProductNotFound";
import classes from "./ProductView.module.scss";

// recharts is a third of the bundle and only this page draws a chart, so it is a chunk of its own
const PriceChart = lazy(() =>
  import("@/entities/price-history/ui/PriceChart/PriceChart").then((module) => ({
    default: module.PriceChart,
  })),
);

/** One product: its price, its price history and the same product in other stores. */
export function ProductView() {
  const { id = "" } = useParams();
  const detail = useProductDetail(id);
  const history = usePriceHistory(id);
  // A product held from the search shows at once, so its image can fly over from the card
  const preview = useProductPreview(id);
  // Fixed for the page's life, so the chart and the notes agree on what "today" is
  const [now] = useState(() => new Date());

  const missing = detail.isError && isMissingProduct(detail.error);
  const product = detail.data?.product ?? preview;
  useDocumentTitle(missing ? PRODUCT_TEXT.notFoundTitle : product?.title);

  if (missing) {
    return (
      <Container>
        <ProductNotFound />
      </Container>
    );
  }
  if (detail.isError && !product) {
    return (
      <Container className={classes.page}>
        <ErrorState error={detail.error} onRetry={() => void detail.refetch()} titleOrder={1} />
      </Container>
    );
  }

  const data = detail.data;
  const cheapestId =
    data && data.sameProducts.length > 0
      ? cheapestSame([data.product, ...data.sameProducts])
      : null;

  const chartSkeleton = <Skeleton className={classes.chartSkeleton} />;
  let chart;
  if (history.isError) {
    chart = (
      <ErrorState error={history.error} onRetry={() => void history.refetch()} titleOrder={3} />
    );
  } else if (history.data) {
    chart = (
      <Suspense fallback={chartSkeleton}>
        <PriceChart points={toChartPoints(history.data.points, now, LIMITS.historyDaysDefault)} />
      </Suspense>
    );
  } else {
    chart = chartSkeleton;
  }

  return (
    <Container className={classes.page}>
      {product ? (
        <ProductHeader
          product={product}
          pending={detail.isPending}
          insight={
            data
              ? {
                  note: priceHistoryNote(data.insight, now).text,
                  saleLabel: inflatedLabel(data.insight.inflatedDiscount),
                  inflated: data.insight.inflatedDiscount,
                  cheapest: cheapestId === data.product.id,
                }
              : null
          }
        />
      ) : (
        <Skeleton className={classes.headerSkeleton} />
      )}

      {/* A failed product request is the one error on the page, whatever the history did */}
      {detail.isError ? (
        <ErrorState error={detail.error} onRetry={() => void detail.refetch()} titleOrder={2} />
      ) : (
        <section aria-labelledby="price-history-heading" className={classes.history}>
          <div>
            <Title order={2} id="price-history-heading" className={classes.heading}>
              {PRODUCT_TEXT.historyHeading}
            </Title>
            <Text className={classes.window}>
              {PRODUCT_TEXT.historyWindow(LIMITS.historyDaysDefault)}
            </Text>
          </div>
          {chart}
        </section>
      )}

      {data && (
        <StoreComparison
          same={data.sameProducts}
          similar={data.similarProducts}
          cheapestId={cheapestId}
        />
      )}
    </Container>
  );
}
