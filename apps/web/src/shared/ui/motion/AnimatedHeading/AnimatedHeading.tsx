import { Title, type TitleOrder } from "@mantine/core";
import { useReducedMotion } from "motion/react";
import BlurText from "@/shared/vendor/react-bits/BlurText/BlurText";
import { MOTION } from "@/shared/theme/motion";
import classes from "./AnimatedHeading.module.scss";

interface AnimatedHeadingProps {
  text: string;
  order?: TitleOrder;
  className?: string;
}

/** A heading whose words come into focus one after another. */
export function AnimatedHeading({ text, order = 1, className }: AnimatedHeadingProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <Title order={order} className={className}>
        {text}
      </Title>
    );
  }

  return (
    <Title
      order={order}
      className={className}
      // BlurText renders a <p>, which an <h1> may not contain; an ARIA heading may
      renderRoot={(props) => <div {...props} role="heading" aria-level={order} />}
    >
      <BlurText
        text={text}
        animateBy="words"
        direction="bottom"
        trigger="load"
        stepDuration={MOTION.duration.slow}
        className={classes.text}
      />
    </Title>
  );
}
