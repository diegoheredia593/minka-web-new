"use client";

import { motion } from "framer-motion";

type ScaleLetterTextProps = {
  text: string;
  className?: string;
  ariaLabel?: string;
};

export function ScaleLetterText({
  text,
  className = "",
  ariaLabel = text,
}: ScaleLetterTextProps) {
  return (
    <span className={`scale-letter-text ${className}`} aria-label={ariaLabel}>
      {text.split("").map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          aria-hidden="true"
          whileHover={{ scale: 1.25, rotateX: 8, rotateY: -6 }}
          whileTap={{ scale: 1.15, rotateX: 6, rotateY: -4 }}
          transition={{ type: "spring", stiffness: 250, damping: 20, mass: 0.4 }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
}
