import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import ShinyText from "@/shared/vendor/react-bits/ShinyText/ShinyText";
import { COLORS } from "@/shared/theme/tokens";

interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
}

/** Ink text with a light sweeping across it, for sale headings. */
export function ShimmerText({ children, className }: ShimmerTextProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <span className={className}>{children}</span>;

  // ShinyText parses the colors itself, so it gets hex values, not CSS variables.
  // The shine is `muted`, which still passes AA on paper, so the text stays readable mid-sweep.
  return (
    <ShinyText color={COLORS.ink} shineColor={COLORS.muted} className={className}>
      {children}
    </ShinyText>
  );
}
