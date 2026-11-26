// Motion tokens. Durations are in seconds, as motion takes them; Mantine gets them through secondsToMs.

export const MOTION = {
  duration: {
    /** Hover, press, small state changes */
    fast: 0.15,
    /** Page transitions, dialogs, menus */
    base: 0.25,
    /** Larger surfaces and layout changes */
    slow: 0.4,
    /** A number counting up, long enough to read the digits roll */
    count: 1.2,
    /** The price history line drawing itself */
    draw: 0.8,
  },
  /** Fast start, soft landing */
  ease: [0.2, 0, 0, 1] as const,
  /** How far a page moves while it fades in, in px */
  pageOffset: 8,
  /** The size a result card grows from when it appears and shrinks to when it leaves */
  cardScale: 0.96,
} as const;

export type MotionEase = typeof MOTION.ease;
