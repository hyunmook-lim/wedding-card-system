'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { RefObject } from 'react';

interface AdaptiveBackgroundProps {
  fadeInTargetRef: RefObject<HTMLDivElement | null>;
  fadeOutTargetRef: RefObject<HTMLDivElement | null>;
}

export default function AdaptiveBackground({ fadeInTargetRef, fadeOutTargetRef }: AdaptiveBackgroundProps) {
  // 1. Fade-In Scroll Progress (based on the Date section)
  // Starts when sec_4 starts entering (start end) -> Fully visible when it's halfway in (center center or start center)
  const { scrollYProgress: fadeInProgress } = useScroll({
    target: fadeInTargetRef as RefObject<HTMLElement>,
    offset: ["start end", "start center"]
  });

  // 2. Fade-Out Scroll Progress (based on the Gallery section)
  // Starts when sec_8 starts entering (start end) -> Fully invisible when it's fully in (start start)
  const { scrollYProgress: fadeOutProgress } = useScroll({
    target: fadeOutTargetRef as RefObject<HTMLElement>,
    offset: ["start end", "start start"]
  });

  // Combine them into a single opacity motion value
  // In: 0 -> 1
  // Out: 0 (opaque) -> 1 (transparent)
  const opacity = useTransform(
    [fadeInProgress, fadeOutProgress],
    ([vIn, vOut]: number[]) => vIn * (1 - vOut)
  );

  return (
    <motion.div 
      className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] pointer-events-none z-0"
      style={{ opacity }}
    >
      <Image 
        src="/bg/silk-bg-fixed-dark.jpeg" 
        alt="Adaptive Background" 
        fill 
        className="object-cover"
        priority
      />
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-white/5" />
    </motion.div>
  );
}
