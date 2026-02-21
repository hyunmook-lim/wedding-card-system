'use client';

import { SectionProps } from '@/types/wedding';
import { useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import { useTitleAnimation } from '@/hooks/useTitleAnimation';

export default function SoftTypingDate({ config, isVisible }: SectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { animationState, titleVariants } = useTitleAnimation();

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

  const { date, groom, bride } = config;
  
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

  // Calculate D-day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weddingDate = new Date(dateObj);
  weddingDate.setHours(0, 0, 0, 0);
  const diffTime = weddingDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const groomName = (groom as string) || '신랑';
  const brideName = (bride as string) || '신부';

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
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-[#fffdf7] overflow-hidden perspective-[1000px]">
        {/* Title Layer */}
        <motion.div
           initial="hidden"
           animate={animationState}
           variants={titleVariants}
           className="absolute z-20 text-center"
           style={{ willChange: "transform, opacity" }}
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
           style={{ willChange: "transform, opacity" }}
        >
            <motion.div 
                key={animationState} // Force re-render to restart animation
                variants={sentence} 
                initial="hidden"
                animate={animationState === 'top' ? 'top' : 'hidden'}
                style={{ willChange: "opacity" }}
            >
                <div className="block whitespace-nowrap">
                    {fullDateString.split("").map((char, index) => (
                        <motion.span key={char + "-" + index} variants={letter} className="text-3xl font-serif text-slate-800" style={{ willChange: "transform, opacity" }}>
                            {char}
                        </motion.span>
                    ))}
                </div>
                 <div className="block mt-4">
                    {timeString.split("").map((char, index) => (
                        <motion.span key={char + "-time-" + index} variants={letter} className="text-2xl font-light text-slate-600" style={{ willChange: "transform, opacity" }}>
                            {char}
                        </motion.span>
                    ))}
                </div>
                <motion.div 
                    variants={letter} 
                    className="block mt-24 text-center text-[rgb(255,182,193)]"
                    style={{ willChange: "transform, opacity" }}
                >
                    <p className="text-lg font-medium whitespace-nowrap">
                        {groomName} & {brideName} 님의 결혼식이
                    </p>
                    <p className="text-xl font-semibold mt-1">
                        {daysLeft > 0 ? `${daysLeft}일 남았습니다.` : daysLeft === 0 ? '오늘입니다!' : `${Math.abs(daysLeft)}일 지났습니다.`}
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
