"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface FadeOutProps {
  isVisible: boolean;
  children: ReactNode;
  duration?: number;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  onComplete?: () => void;
  className?: string;
}

export function FadeOut({
  isVisible,
  children,
  duration = 0.5,
  delay = 0,
  direction = "none",
  onComplete,
  className,
}: FadeOutProps) {
  const getExitProps = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: -20 };
      case "down":
        return { opacity: 0, y: 20 };
      case "left":
        return { opacity: 0, x: -20 };
      case "right":
        return { opacity: 0, x: 20 };
      case "none":
      default:
        return { opacity: 0 };
    }
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className={className}
          initial={{ opacity: 1, x: 0, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={getExitProps()}
          transition={{ duration, delay, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
