import { LIMITS, type PriceInsightDto } from "@storeseeker/shared";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { DAY_MS } from "../model/constants";
import type { PriceHistoryNote } from "../model/types";

/**
 * The lowest price of the last 30 days, or the day the history starts while it is shorter than
 * that, since a lowest price over a few days would mislead.
 */
export function priceHistoryNote(insight: PriceInsightDto, now: Date): PriceHistoryNote {
  const historyMs = now.getTime() - new Date(insight.historySince).getTime();
  if (historyMs < LIMITS.lowestPriceWindowDays * DAY_MS) {
    return { kind: "historySince", text: `Povijest od ${formatDate(insight.historySince)}` };
  }
  return {
    kind: "lowest30d",
    text: `Najniža u ${LIMITS.lowestPriceWindowDays} dana: ${formatPrice(insight.lowest30dCents)}`,
  };
}
