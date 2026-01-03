'use client';

import { SectionProps } from '@/types/wedding';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, Variants } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';

// Helper component for scrambling effect (unchanged)
function ScrambleText({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  useEffect(() => {
    let iteration = 0;
    let interval: NodeJS.Timeout;
    
    // Start delay
    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              // Only scramble the current character being "typed"
              if (index < iteration + 1) {
                  return chars[Math.floor(Math.random() * chars.length)];
              }
              // Future characters are hidden
              return '';
            })
            .join('')
        );

        if (iteration >= text.length) {
          clearInterval(interval);
        }

        iteration += 1 / 3; // Controls speed: lower means more scramble per letter
      }, 30);
    }, delay * 1000);

    return () => {
      clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
    };
  }, [text, delay]);

  return (
    <span className={className}>{displayText}</span>
  );
}

export default function TypingDate({ config, isVisible }: SectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [animationState, setAnimationState] = useState<'hidden' | 'visible' | 'top'>('hidden');

  const { scrollYProgress } = useScroll({
    target: containerRef,
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
      y: "30vh", 
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
      y: "-40vh", // Move up
      opacity: 1,
      scale: 0.8,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 0, y: 20 }, // Content hidden while title is just appearing
    top: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, delay: 0.2, ease: "easeInOut" } // Appear when title moves up
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

  return (
    <section ref={containerRef} className="relative h-[200vh]">
      <div className="sticky top-0 left-0 w-full h-screen flex flex-col items-center justify-center bg-white overflow-hidden perspective-[1000px]">
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
            {animationState === 'top' && (
                <>
                    <div className="block h-[40px]">
                         <ScrambleText 
                            text={fullDateString} 
                            delay={0.2} 
                            className="text-3xl font-serif text-slate-800" 
                         />
                    </div>
                    
                    <div className="block mt-4 h-[32px]">
                         <ScrambleText 
                            text={timeString} 
                            delay={0.8} 
                            className="text-2xl font-light text-slate-600" 
                         />
                    </div>
                </>
            )}
        </motion.div>
      </div>
    </section>
  );
}
