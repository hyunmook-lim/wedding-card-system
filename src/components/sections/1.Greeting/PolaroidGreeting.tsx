'use client';

import { useMemo, useState } from 'react';
import { useScroll, useTransform, motion, MotionValue, useMotionValueEvent } from 'framer-motion';
import { SectionProps } from '@/types/wedding';
import { Typography } from '@/components/ui/Typography';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import Image from 'next/image';

/**
 * Individual Polaroid Item Component
 * Handles its own scroll transformations to keep hooks at the top level of this child.
 */
function PolaroidItem({ 
  src, 
  caption, 
  index, 
  total, 
  scrollYProgress, 
  scrollYExit,
  rotation 
}: { 
  src: string; 
  caption?: string; 
  index: number; 
  total: number; 
  scrollYProgress: MotionValue<number>;
  scrollYExit: MotionValue<number>;
  rotation: number;
}) {
  const [isOnStage, setIsOnStage] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Appearance timing
  const start = 0.1 + (index * 0.8) / total;
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= start) setIsOnStage(true);
    else setIsOnStage(false);
  });

  useMotionValueEvent(scrollYExit, "change", (latest) => {
    if (latest > 0) setIsExiting(true);
    else setIsExiting(false);
  });

  return (
    <motion.div
      initial={false}
      animate={{ 
        y: isOnStage ? 0 : 600, 
        opacity: isExiting ? 0 : (isOnStage ? 1 : 0), 
        scale: isExiting ? 0.9 : (isOnStage ? 1 : 0.8),
        filter: isExiting ? "blur(10px)" : "blur(0px)",
        rotate: rotation,
      }}
      transition={{ 
        duration: 1.0, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      style={{ 
        zIndex: index + 10 
      }}
      className="absolute w-[80vw] max-w-[300px] bg-white p-3 pb-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-sm border border-gray-100"
    >
      {/* Photo Frame */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 rounded-sm">
        <Image
          src={src}
          alt={`Polaroid ${index}`}
          fill
          className="object-cover"
          unoptimized
        />
        {/* Subtle inner shadow on photo */}
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] pointer-events-none" />
      </div>

      {/* Caption */}
      {caption && (
        <div className="mt-4 px-1 text-center">
          <Typography className="font-serif italic text-gray-700 text-sm tracking-tight leading-relaxed">
            {caption}
          </Typography>
        </div>
      )}
    </motion.div>
  );
}

export default function PolaroidGreeting({ config, isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  
  const { scrollYProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start start', 'end end'],
  });

  // Exit phase: When the sticky container scrolls out of view
  const { scrollYProgress: scrollYExit } = useScroll({
    target: scrollRef || undefined,
    offset: ['end end', 'end start'],
  });

  // Extract config
  const images = useMemo(() => (config.images as string[]) || [], [config.images]);
  const captions = useMemo(() => (config.captions as string[]) || [], [config.captions]);

  // Deterministic rotations for purity (based on image strings)
  const rotations = useMemo(() => 
    images.map((src, i) => {
      const charSum = src.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return ((charSum + i) % 30) - 15; // Stable value between -15 and 14
    }),
    [images]
  );

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  if (!isVisible) return null;

  return (
    <div className="relative w-full h-full bg-neutral-100 flex items-center justify-center overflow-hidden">
      {/* Background Layer - Matches the project theme */}
      <div className="absolute inset-0 bg-neutral-100" />

      {/* Scroll Hint - Initially visible on white screen */}
      <motion.div 
        style={{ opacity: scrollHintOpacity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <ScrollIndicator color="#999999" text="아래로 스크롤해보세요" />
      </motion.div>

      {/* Polaroid Stacking Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {images.map((src, idx) => (
          <PolaroidItem
            key={`${src}-${idx}`}
            src={src}
            caption={captions[idx]}
            index={idx}
            total={images.length}
            scrollYProgress={scrollYProgress}
            scrollYExit={scrollYExit}
            rotation={rotations[idx]}
          />
        ))}
      </div>
      
      {/* Vignette effect for depth */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.03)]" />
    </div>
  );
}
