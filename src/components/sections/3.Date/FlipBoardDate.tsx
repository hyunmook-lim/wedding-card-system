'use client';

import { SectionProps } from '@/types/wedding';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { useState, useEffect, useRef } from 'react';

const FlipUnit = ({ label, value, triggered, delay = 0, isWide = false }: { label: string; value: string; triggered: boolean; delay?: number; isWide?: boolean }) => {
  const [currentValue, setCurrentValue] = useState(' ');
  const [nextValue, setNextValue] = useState(' ');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const currentValueRef = useRef(currentValue);
  const animationSessionRef = useRef(0);

  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  useEffect(() => {
    const targetChar = triggered ? value : ' ';
    if (currentValueRef.current === targetChar) return;

    // Increment session ID to cancel previous loops
    const sessionId = ++animationSessionRef.current;
    let initialTimeoutId: NodeJS.Timeout;
    const activeTimeouts: NodeJS.Timeout[] = [];

    const startAnimation = () => {
      if (sessionId !== animationSessionRef.current) return;

      const chars = isWide ? ' ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ' 0123456789';
      const startIndex = chars.indexOf(currentValueRef.current);
      const targetIndex = chars.indexOf(targetChar);
      
      if (startIndex === -1 || targetIndex === -1) return;

      const sequence: string[] = [];
      const steps = (targetIndex - startIndex + chars.length) % chars.length;
      
      // 기계적인 느낌을 위해 최소 회전수(minSteps) 적용
      // 단, 리셋 시(공백으로 갈 때)는 조금 더 빠르게 반응하도록 조정 가능
      const minSteps = triggered ? 5 : 2;
      const actualSteps = steps < minSteps ? steps + chars.length : steps;

      for (let i = 1; i <= actualSteps; i++) {
        sequence.push(chars[(startIndex + i) % chars.length]);
      }

      let currentStep = 0;

      const flipNext = () => {
        if (sessionId !== animationSessionRef.current) return;
        if (currentStep >= sequence.length) return;

        const nextVal = sequence[currentStep];
        setNextValue(nextVal);
        setIsAnimating(true);

        const progress = currentStep / (sequence.length - 1);
        const animDelay = 20 + Math.pow(progress, 4) * 180; 

        const t1 = setTimeout(() => {
          if (sessionId !== animationSessionRef.current) return;
          
          setCurrentValue(nextVal);
          setIsAnimating(false);
          currentStep++;
          
          const t2 = setTimeout(flipNext, 10);
          activeTimeouts.push(t2);
        }, animDelay);
        
        activeTimeouts.push(t1);
      };

      flipNext();
    };

    if (triggered) {
      const randomOffset = Math.random() * 600; 
      const totalDelay = delay + randomOffset;
      initialTimeoutId = setTimeout(startAnimation, totalDelay);
    } else {
      startAnimation();
    }

    return () => {
      if (initialTimeoutId) clearTimeout(initialTimeoutId);
      activeTimeouts.forEach(t => clearTimeout(t));
    };
  }, [triggered, value, isWide, delay]);

  const widthClass = "w-[32px] sm:w-10"; // Smaller width for individual characters
  const heightClass = "h-14 sm:h-16"; // Decreased height
  const fontSizeClass = "text-3xl sm:text-4xl"; // Smaller font size

  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-[10px] font-medium text-stone-400 mb-1 tracking-widest uppercase">{label}</span>}
      <div 
        className={`relative rounded-md ${widthClass} ${heightClass} flex flex-col overflow-hidden shadow-lg border border-black/20 bg-[#1e1e1e]`}
        style={{ perspective: '400px' }}
      >
        {/* === BASE LAYERS (Static) === */}
        {/* Top half (next value) */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#2a2a2a] overflow-hidden border-b border-black/40">
           <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className={`${fontSizeClass} font-mono text-white leading-none`}>{nextValue}</span>
           </div>
        </div>
        
        {/* Bottom half (current value) */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#1e1e1e] overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className={`${fontSizeClass} font-mono text-white leading-none`}>{currentValue}</span>
           </div>
        </div>

        {/* === ANIMATING FLAP (Front & Back) === */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              key={currentValue + nextValue}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -180 }}
              transition={{ duration: 0.3, ease: "linear" }}
              style={{ 
                transformOrigin: 'bottom', 
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d'
              }}
              className="absolute top-0 left-0 w-full h-1/2 z-20"
            >
              {/* === FRONT CONTAiNER === */}
              {/* Drops down from 0 to -90, showing current value top half */}
              <div 
                 className="absolute inset-0 w-full h-full overflow-hidden border-b border-black/40 rounded-t-md"
                 style={{ 
                   backgroundColor: '#2a2a2a',
                   backfaceVisibility: 'hidden',
                   WebkitBackfaceVisibility: 'hidden'
                 }}
              >
                 <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className={`${fontSizeClass} font-mono text-white leading-none`}>{currentValue}</span>
                 </div>
              </div>
              
              {/* === BACK CONTAINER === */}
              {/* Appears after -90, rotating from 90 to 0, showing next value bottom half */}
              <div 
                 className="absolute inset-0 w-full h-full overflow-hidden rounded-b-md border-b border-black/10"
                 style={{ 
                   backgroundColor: '#1e1e1e',
                   backfaceVisibility: 'hidden',
                   WebkitBackfaceVisibility: 'hidden',
                   transform: 'rotateX(180deg)' // This makes it stick to the back of the front container
                 }}
              >
                 {/* 
                     Because it's rotated 180deg on X, we effectively see the bottom half of the number upside down.
                     And because the wrapper rotates -180deg, this backface ends up at 0deg (upright) mapping to the bottom half.
                 */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className={`${fontSizeClass} font-mono text-white leading-none`}>{nextValue}</span>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Middle Line Gap */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/60 z-30 pointer-events-none shadow-[0_0_2px_rgba(0,0,0,0.8)]"></div>
      </div>
    </div>
  );
};

/**
 * FlipBoardDate component
 * A clean, emotional flipboard date display.
 */
export default function FlipBoardDate({ config, isVisible }: SectionProps) {
  const containerRef = useStickyScrollRef();
  const [triggered, setTriggered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef as React.RefObject<HTMLElement>, // Cast needed due to React 19 types
    offset: ['start end', 'end start']
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 0.4 && !triggered) {
      setTriggered(true);
    } else if (latest < 0.4 && triggered) {
      setTriggered(false);
    }
  });

  if (!isVisible) return null;

  const { date } = config;
  const dateObj = new Date(date as string);
  
  const year = String(dateObj.getUTCFullYear()).slice(-2);
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayName = days[dateObj.getUTCDay()];

  const hours = String(dateObj.getUTCHours()).padStart(2, '0');
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');

  return (
    <section className="relative w-full h-full bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center justify-center max-w-[400px] w-full gap-10 aspect-[4/5]"
      >
        {/* Date Row: YY / MM / DD */}
        <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-medium text-stone-400 tracking-widest uppercase">Date</span>
            <div className="flex gap-2 items-center justify-center w-full">
                <FlipUnit label="" value={year[0]} triggered={triggered} />
                <FlipUnit label="" value={year[1]} triggered={triggered} />
                <span className="text-stone-300 font-light px-1">/</span>
                <FlipUnit label="" value={month[0]} triggered={triggered} />
                <FlipUnit label="" value={month[1]} triggered={triggered} />
                <span className="text-stone-300 font-light px-1">/</span>
                <FlipUnit label="" value={day[0]} triggered={triggered} />
                <FlipUnit label="" value={day[1]} triggered={triggered} />
            </div>
        </div>

        {/* Divider */}
        <div className="w-16 h-[1px] bg-stone-200/60 rounded-full"></div>

        {/* Day Row: DOW */}
        <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-medium text-stone-400 tracking-widest uppercase">Day</span>
            <div className="flex gap-2 items-center justify-center w-full">
                <FlipUnit label="" value={dayName[0]} triggered={triggered} isWide />
                <FlipUnit label="" value={dayName[1]} triggered={triggered} isWide />
                <FlipUnit label="" value={dayName[2]} triggered={triggered} isWide />
            </div>
        </div>

        {/* Divider */}
        <div className="w-16 h-[1px] bg-stone-200/60 rounded-full"></div>

         {/* Time Row: HH : MM */}
         <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-medium text-stone-400 tracking-widest uppercase">Time</span>
            <div className="flex gap-2 items-center justify-center w-full">
                <FlipUnit label="" value={hours[0]} triggered={triggered} />
                <FlipUnit label="" value={hours[1]} triggered={triggered} />
                <span className="text-stone-300 px-1 text-2xl font-light animate-pulse">:</span>
                <FlipUnit label="" value={minutes[0]} triggered={triggered} />
                <FlipUnit label="" value={minutes[1]} triggered={triggered} />
            </div>
        </div>
      </motion.div>
    </section>
  );
}
