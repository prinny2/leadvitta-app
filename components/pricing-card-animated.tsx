"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

interface Props {
  index: number;
  isPopular: boolean;
  cardStyle: CSSProperties;
  children: ReactNode;
}

export function PricingCardAnimated({
  index,
  isPopular,
  cardStyle,
  children,
}: Props) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{
        y: isPopular ? -20 : 0,
        opacity: 1,
        x: index === 2 ? -30 : index === 0 ? 30 : 0,
        scale: index === 0 || index === 2 ? 0.94 : 1.0,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 1.6,
        type: "spring",
        stiffness: 100,
        damping: 30,
        delay: 0.1 + index * 0.12,
        opacity: { duration: 0.45 },
      }}
      style={{
        ...cardStyle,
        zIndex: isPopular ? 10 : 0,
        transformOrigin:
          index === 0
            ? "right center"
            : index === 2
              ? "left center"
              : "center center",
      }}
    >
      {children}
    </motion.div>
  );
}
