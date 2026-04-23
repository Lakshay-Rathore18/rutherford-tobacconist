"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUpVariants } from "@/lib/motion";

type Props = HTMLMotionProps<"div"> & {
  delay?: number;
  amount?: number;
};

/**
 * Wrapper that reveals on scroll-into-view. Reduced-motion respected globally
 * via CSS @media; framer-motion also reads prefers-reduced-motion.
 */
export function MotionReveal({ delay = 0, amount = 0.2, children, ...rest }: Props) {
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
