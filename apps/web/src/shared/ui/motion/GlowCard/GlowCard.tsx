import type { HTMLAttributes } from "react";
import { useReducedMotion } from "motion/react";
import SpotlightCard from "@/shared/vendor/react-bits/SpotlightCard/SpotlightCard";
import { COLORS } from "@/shared/theme/tokens";
import classes from "./GlowCard.module.scss";

type GlowCardProps = HTMLAttributes<HTMLDivElement>;

/** A card with a soft light that follows the pointer and lights up its border. */
export function GlowCard({ className, children, ...rest }: GlowCardProps) {
  const reduceMotion = useReducedMotion();
  const classNames = [classes.card, className].filter(Boolean).join(" ");

  if (reduceMotion) {
    return (
      <div className={`${classNames} ${classes.still}`} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <SpotlightCard theme="light" spotlightColor={COLORS.ink} className={classNames} {...rest}>
      {children}
    </SpotlightCard>
  );
}
