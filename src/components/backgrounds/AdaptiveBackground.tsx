'use client';

import { motion, useScroll } from 'framer-motion';
import Image from 'next/image';
import { RefObject } from 'react';

interface AdaptiveBackgroundProps {
  fadeInTargetRef: RefObject<HTMLDivElement | null>;
}

export default function AdaptiveBackground({ fadeInTargetRef }: AdaptiveBackgroundProps) {
  // 1. Fade-In Scroll Progress (based on the Date section)
  // Starts when sec_4 starts entering (start end) -> Fully visible when it's halfway in (center center or start center)
  const { scrollYProgress: fadeInProgress } = useScroll({
    target: fadeInTargetRef as RefObject<HTMLElement>,
    offset: ["start end", "start center"]
  });

  // Fade-out logic removed so the dark background persists to the end of the page
  const opacity = fadeInProgress;

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
