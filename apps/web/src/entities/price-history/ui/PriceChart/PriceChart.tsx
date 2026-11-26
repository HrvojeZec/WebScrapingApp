import { LineChart } from "@mantine/charts";
import { useReducedMotion } from "motion/react";
import { secondsToMs } from "@/shared/lib/motion";
import { MOTION } from "@/shared/theme/motion";
import { chartDateText, chartPriceText } from "../../lib/chart-points";
import { PRICE_CHART_SIZE, PRICE_CHART_TEXT } from "../../model/constants";
import type { ChartPoint } from "../../model/types";
import classes from "./PriceChart.module.scss";

/** The stored prices as steps: a price holds until the next one was seen. */
export function PriceChart({ points }: { points: ChartPoint[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <LineChart
      className={classes.chart}
      h={PRICE_CHART_SIZE.height}
      data={points}
      dataKey="date"
      series={[{ name: "price", label: PRICE_CHART_TEXT.series, color: "ink.6" }]}
      curveType="stepAfter"
      withDots={false}
      strokeWidth={PRICE_CHART_SIZE.strokeWidth}
      gridAxis="y"
      valueFormatter={chartPriceText}
      xAxisProps={{
        type: "number",
        scale: "time",
        domain: ["dataMin", "dataMax"],
        tickFormatter: chartDateText,
        minTickGap: PRICE_CHART_SIZE.minTickGap,
      }}
      yAxisProps={{ domain: ["auto", "auto"], width: PRICE_CHART_SIZE.yAxisWidth }}
      tooltipProps={{ labelFormatter: chartDateText }}
      tooltipAnimationDuration={reduceMotion ? 0 : secondsToMs(MOTION.duration.fast)}
      lineProps={{
        isAnimationActive: !reduceMotion,
        animationDuration: secondsToMs(MOTION.duration.draw),
        animationEasing: "ease-out",
      }}
      accessibilityLayer
    />
  );
}
