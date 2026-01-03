'use client';

import { useRef } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export default function SectionDebugWrapper({ children, type, index }: { children: React.ReactNode; type: string; index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (progressRef.current) {
      if (latest > 0 && latest < 1) {
        progressRef.current.style.opacity = '1';
        progressRef.current.innerText = `[${type}] Scroll: ${Math.round(latest * 100)}%`;
      } else {
        progressRef.current.style.opacity = '0';
      }
    }
  });

  // Base top offset + index * 30px
  const topOffset = 80 + (index * 30);

  return (
    <div ref={containerRef} className="relative w-full">
      <div 
        ref={progressRef}
        className="fixed left-4 z-[9999] px-2 py-1 bg-blue-600/80 text-white text-xs font-mono rounded pointer-events-none opacity-0 transition-opacity duration-200"
        style={{ top: `${topOffset}px` }}
      >
        [{type}] Scroll: 0%
      </div>
      {children}
    </div>
  );
}
