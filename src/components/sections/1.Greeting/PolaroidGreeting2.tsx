'use client';

import { useMemo, useState } from 'react';
import { useScroll, useTransform, motion, MotionValue, useMotionValueEvent } from 'framer-motion';
import { SectionProps } from '@/types/wedding';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import Image from 'next/image';

/**
 * Individual Grid Polaroid Item
 */
function GridPolaroidItem({ 
  src, 
  caption, 
  index, 
  total, 
  scrollYProgress, 
  scrollYExit,
  gridPos,
  randomOffset,
  appearanceIndex
}: { 
  src: string; 
  caption?: string; 
  index: number; 
  total: number; 
  scrollYProgress: MotionValue<number>;
  scrollYExit: MotionValue<number>;
  gridPos: { x: number, y: number };
  randomOffset: { x: number, y: number, rotate: number };
  appearanceIndex: number;
}) {
  const [isOnStage, setIsOnStage] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Randomized appearance timing
  const start = 0.05 + (appearanceIndex * 0.75) / total;
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= start) setIsOnStage(true);
    else setIsOnStage(false);
  });

  useMotionValueEvent(scrollYExit, "change", (latest) => {
    if (latest > 0) setIsExiting(true);
    else setIsExiting(false);
  });

  // Calculate target position based on 3x3 grid
  // Assuming a container of roughly 360px width
  // Use vw for responsive layout (3 columns, each slightly less than 1/3)
  const cellSizeX = 32; // vw
  const cellSizeY = 42; // vw
  const targetX = (gridPos.x - 1) * cellSizeX + randomOffset.x;
  const targetY = (gridPos.y - 1) * cellSizeY + randomOffset.y;
  const captionOpacity = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);

  return (
    <motion.div
      initial={false}
      animate={{ 
        x: `${targetX}vw`,
        y: `${targetY}vw`,
        opacity: isExiting ? 0 : (isOnStage ? 1 : 0), 
        scale: isExiting ? 0.8 : (isOnStage ? 1 : 0.8),
        filter: (isExiting || !isOnStage) ? "blur(10px)" : "blur(0px)",
        rotate: randomOffset.rotate,
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1]
      }}
      style={{ 
        zIndex: index + 10 
      }}
      className="absolute w-[31vw] bg-white p-[1.5vw] pb-[5vw] shadow-xl rounded-sm border border-gray-100"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={src}
          alt={`Grid Polaroid ${index}`}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      {caption && (
        <div className="mt-[2vw] px-0.5 text-center">
          <motion.p 
            style={{ opacity: captionOpacity }}
            className="font-[family-name:var(--font-pacifico)] text-gray-800 text-[3.8vw] leading-tight"
          >
            {caption}
          </motion.p>
        </div>
      )}
    </motion.div>
  );
}

export default function PolaroidGreeting2({ config, isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  
  const { scrollYProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start start', 'end end'],
  });

  const { scrollYProgress: scrollYExit } = useScroll({
    target: scrollRef || undefined,
    offset: ['end end', 'end start'],
  });

  const images = useMemo(() => (config.images as string[]) || [], [config.images]);
  const captions = useMemo(() => (config.captions as string[]) || [], [config.captions]);

  // Generate stable grid positions and offsets
  const gridData = useMemo(() => {
    const shuffledOrder = [5, 1, 8, 3, 0, 7, 2, 4, 6]; 

    return images.slice(0, 9).map((src, i) => {
      const charSum = src.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return {
        appearanceIndex: shuffledOrder[i % shuffledOrder.length],
        gridPos: {
          x: i % 3,
          y: Math.floor(i / 3)
        },
        randomOffset: {
          x: ((charSum + i) % 4) - 2,
          y: ((charSum * i) % 4) - 2,
          rotate: ((charSum + i * 7) % 20) - 10
        }
      };
    });
  }, [images]);


  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  if (!isVisible) return null;

  return (
    <div className="relative w-full h-full bg-neutral-100 flex items-center justify-center overflow-hidden">
      {/* Scroll Hint */}
      <motion.div 
        style={{ opacity: scrollHintOpacity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <ScrollIndicator color="#999999" text="아래로 스크롤해보세요" />
      </motion.div>

      {/* Grid Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {images.slice(0, 9).map((src, idx) => (
          <GridPolaroidItem
            key={`${src}-${idx}`}
            src={src}
            caption={captions[idx]}
            index={idx}
            total={9}
            scrollYProgress={scrollYProgress}
            scrollYExit={scrollYExit}
            gridPos={gridData[idx].gridPos}
            randomOffset={gridData[idx].randomOffset}
            appearanceIndex={gridData[idx].appearanceIndex}
          />
        ))}
      </div>
    </div>
  );
}
