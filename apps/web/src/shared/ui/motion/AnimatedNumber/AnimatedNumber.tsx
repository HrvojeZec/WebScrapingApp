import { useReducedMotion } from "motion/react";
import CountUp from "@/shared/vendor/react-bits/CountUp/CountUp";
import { HR_GROUP_SEPARATOR, splitNumber } from "@/shared/lib/motion";
import { MOTION } from "@/shared/theme/motion";
import classes from "./AnimatedNumber.module.scss";

interface AnimatedNumberProps {
  value: number;
  /** A formatter from `shared/lib/format.ts`, e.g. `formatPrice` or `formatDiscount` */
  format: (value: number) => string;
  className?: string;
}

/**
 * A number whose digits roll up to `format(value)` when it scrolls into view.
 * CountUp only knows "." decimals, so it rolls the whole part and keeps the rest as text.
 */
export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const text = format(value);
  const parts = splitNumber(text);

  if (reduceMotion || !parts) return <span className={className}>{text}</span>;

  return (
    <span className={[classes.root, className].filter(Boolean).join(" ")}>
      {/* Holds the final width, so digits rolling in never push the text around them */}
      <span className={classes.ghost} aria-hidden="true">
        {text}
      </span>
      <CountUp
        className={classes.counter}
        to={parts.value}
        prefix={parts.prefix}
        suffix={parts.suffix}
        separator={HR_GROUP_SEPARATOR}
        mode="roll"
        duration={MOTION.duration.count}
      />
    </span>
  );
}
