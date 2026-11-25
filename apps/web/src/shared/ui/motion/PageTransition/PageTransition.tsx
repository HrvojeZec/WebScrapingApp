import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocation, useOutlet } from "react-router";
import { MOTION } from "@/shared/theme/motion";
import classes from "./PageTransition.module.scss";

// The leaving page keeps the route it was rendered for while it fades out
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

/** Layout route element: the new page fades in and rises a little, the old one fades out. */
export function PageTransition() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return outlet;

  // "popLayout" takes the leaving page out of the flow at once, so the two pages never stack
  // (no layout shift), and unlike "wait" both are mounted together, which a shared `layoutId`
  // between a card and the product page needs.
  return (
    <div className={classes.root}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: MOTION.pageOffset }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: MOTION.duration.base, ease: MOTION.ease }}
        >
          <FrozenOutlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
