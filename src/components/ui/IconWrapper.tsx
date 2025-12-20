"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface IconWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  size?: number | string; // Numeric px value or arbitrary string (e.g. "2rem")
  className?: string;
}

export function IconWrapper({
  children,
  size = 24,
  className,
  onClick,
  ...props
}: IconWrapperProps) {
  const isInteractive = !!onClick;

  return (
    <motion.div
      whileTap={isInteractive ? { scale: 0.9 } : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center text-current",
        isInteractive && "cursor-pointer hover:opacity-80 active:opacity-70 transition-opacity",
        className
      )}
      style={{ 
        width: size, 
        height: size, 
        fontSize: size // For icon fonts or ensuring consistent SVG sizing context if needed
      }}
      {...props}
    >
      {/* 
        Ideally, children should be an SVG. 
        We ensure it fills the wrapper.
      */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<React.SVGProps<SVGSVGElement>>, {
            width: "100%",
            height: "100%",
          });
        }
        return child;
      })}
    </motion.div>
  );
}
