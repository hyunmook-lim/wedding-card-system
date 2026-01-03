'use client';

import { SectionProps } from '@/types/wedding';
import { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, Variants } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';

export default function SoftTypingDate({ config, isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const containerRef = useRef<HTMLElement>(null);
  const [animationState, setAnimationState] = useState<'hidden' | 'visible' | 'top'>('hidden');

  const { scrollYProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'end start']
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.40) { // User requested 40% for top
      setAnimationState('top');
    } else if (latest > 0.25) { // User requested 25% for visible
      setAnimationState('visible');
    } else {
      setAnimationState('hidden');
    }
  });

  const titleVariants: Variants = {
    hidden: { 
      y: "30lvh", 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 1.0, ease: "easeInOut" }
    },
    visible: { 
      y: 0,
      opacity: 1, 
      scale: 1,
      transition: { duration: 1.0, ease: "easeInOut" }
    },
    top: {
      y: "-40lvh", // Move up
      opacity: 1,
      scale: 0.8,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 0, y: 20 },
    top: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, delay: 0.2, ease: "easeInOut" }
    }
  };

  if (!isVisible) return null;

  const { date } = config;
  
  const dateObj = new Date(date as string);
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayName = days[dateObj.getUTCDay()];

  const hours = dateObj.getUTCHours();
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // 0 should be 12

  const timeString = `${formattedHours}:${minutes} ${ampm}`;
  const fullDateString = `${year}.${month}.${day} ${dayName}`;

  // Text animation variants
  const sentence = {
    hidden: { opacity: 0 },
    visible: { opacity: 0 }, // Hidden initially
    top: {
      opacity: 1,
      transition: {
        delay: 0.4, // Wait for container to appear/move
        staggerChildren: 0.08,
      },
    },
  };

  const letter = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 0, y: 20 },
    top: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
    }
  };

  return (
    <section ref={containerRef} className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden perspective-[1000px]">
        {/* Title Layer */}
        <motion.div
           initial="hidden"
           animate={animationState}
           variants={titleVariants}
           className="absolute z-20 text-center"
        >
             <Typography variant="display">
                 날짜 & 시간
             </Typography>
        </motion.div>

        {/* Content Layer (Date/Time Text) */}
        <motion.div
           initial="hidden"
           animate={animationState}
           variants={contentVariants}
           className="absolute z-10 text-center space-y-6 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pt-20"
        >
            <motion.div 
                key={animationState} // Force re-render to restart animation
                variants={sentence} 
                initial="hidden"
                animate={animationState === 'top' ? 'top' : 'hidden'}
            >
                <div className="block">
                    {fullDateString.split("").map((char, index) => (
                        <motion.span key={char + "-" + index} variants={letter} className="text-3xl font-serif text-slate-800">
                            {char}
                        </motion.span>
                    ))}
                </div>
                 <div className="block mt-4">
                    {timeString.split("").map((char, index) => (
                        <motion.span key={char + "-time-" + index} variants={letter} className="text-2xl font-light text-slate-600">
                            {char}
                        </motion.span>
                    ))}
                </div>
            </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
