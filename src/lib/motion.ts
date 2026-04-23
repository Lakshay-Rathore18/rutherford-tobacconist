import type { Variants, Transition } from "framer-motion";

/** Shared motion variants — reduced-motion respected via CSS @media query. */

export const easing = {
  elegant: [0.22, 1, 0.36, 1] as [number, number, number, number],
  entrance: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.7, 0, 0.84, 0] as [number, number, number, number],
};

export const durations = {
  slow: 0.8,
  medium: 0.4,
  fast: 0.2,
} as const;

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.slow, ease: easing.entrance },
  },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.medium, ease: easing.elegant } },
};

export const stagger = (childDelay = 0.08, parentDelay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: childDelay, delayChildren: parentDelay },
  },
});

export const sheetSlideRight: Transition = {
  duration: durations.medium,
  ease: easing.elegant,
};
