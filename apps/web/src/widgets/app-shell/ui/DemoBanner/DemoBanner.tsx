import { Container } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { useMeta } from "@/entities/meta/hooks/useMeta";
import { MOTION } from "@/shared/theme/motion";
import { SHELL_TEXT } from "../../model/constants";
import classes from "./DemoBanner.module.scss";

/** Says the prices are made up while the API serves the demo seed. */
export function DemoBanner() {
  const { data } = useMeta();
  const reduceMotion = useReducedMotion();

  // Without meta (API down) there is no banner; the page itself reports the error
  if (!data?.demo) return null;

  const content = (
    <Container className={classes.inner}>
      <IconInfoCircle aria-hidden className={classes.icon} />
      {SHELL_TEXT.demoBanner}
    </Container>
  );

  if (reduceMotion) {
    return (
      <div className={classes.banner} role="note">
        {content}
      </div>
    );
  }
  return (
    <motion.div
      className={classes.banner}
      role="note"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: MOTION.duration.base, ease: MOTION.ease }}
    >
      {content}
    </motion.div>
  );
}
