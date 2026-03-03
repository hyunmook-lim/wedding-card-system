'use client';

import { SectionProps } from '@/types/wedding';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { useState, useEffect } from 'react';

const FlipUnit = ({ label, value, triggered, isWide = false }: { label: string; value: string; triggered: boolean; isWide?: boolean }) => {
  const [currentValue, setCurrentValue] = useState(' ');
  const [nextValue, setNextValue] = useState(' ');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const targetChar = triggered ? value : ' ';
    if (currentValue === targetChar) return;

    const startAnimation = async () => {
      // Define the allowed character set (Space comes first)
      const chars = isWide ? ' ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ' 0123456789';
      
      const startIndex = chars.indexOf(currentValue);
      const targetIndex = chars.indexOf(targetChar);
      
      if (startIndex === -1 || targetIndex === -1) return;

      // Create a sequence that ALWAYS moves forward
      const sequence: string[] = [];
      const steps = (targetIndex - startIndex + chars.length) % chars.length;
      
      // Minimum flavor for mechanical feel
      const minSteps = 5;
      const actualSteps = steps < minSteps ? steps + chars.length : steps;

      for (let i = 1; i <= actualSteps; i++) {
        sequence.push(chars[(startIndex + i) % chars.length]);
      }

      let currentStep = 0;

      const flipNext = () => {
        if (currentStep >= sequence.length) return;

        const nextVal = sequence[currentStep];
        setNextValue(nextVal);
        setIsAnimating(true);

        // Ease-out logic
        const progress = currentStep / (sequence.length - 1);
        const delay = 20 + Math.pow(progress, 4) * 180; 

        setTimeout(() => {
          setCurrentValue(nextVal);
          setIsAnimating(false);
          currentStep++;
          setTimeout(flipNext, 10);
        }, delay);
      };

      flipNext();
    };

    startAnimation();
  }, [triggered, value, isWide]);

  const widthClass = "w-[32px] sm:w-10"; // Smaller width for individual characters
  const heightClass = "h-14 sm:h-16"; // Decreased height
  const fontSizeClass = "text-3xl sm:text-4xl"; // Smaller font size

  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-[10px] font-bold text-slate-400 mb-1 tracking-tighter uppercase">{label}</span>}
      <div 
        className={`relative bg-[#1e1e1e] rounded-md ${widthClass} ${heightClass} flex flex-col overflow-hidden shadow-lg border border-black/20`}
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
              style={{ transformOrigin: 'bottom', transformStyle: 'preserve-3d' }}
              className="absolute top-0 left-0 w-full h-1/2 z-20"
            >
              {/* === FRONT CONTAiNER === */}
              {/* Drops down from 0 to -90, showing current value top half */}
              <div 
                 className="absolute inset-0 w-full h-full overflow-hidden border-b border-black/40 rounded-t-md"
                 style={{ 
                   backgroundColor: '#2a2a2a',
                   backfaceVisibility: 'hidden',
                 }}
              >
                 <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className={`${fontSizeClass} font-mono text-white leading-none`}>{currentValue}</span>
                 </div>
              </div>
              
              {/* === BACK CONTAINER === */}
              {/* Appears after -90, rotating from 90 to 0, showing next value bottom half */}
              <div 
                 className="absolute inset-0 w-full h-full overflow-hidden rounded-t-md"
                 style={{ 
                   backgroundColor: '#1e1e1e',
                   backfaceVisibility: 'hidden',
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
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/60 z-30 shadow-[0_0_2px_rgba(0,0,0,0.8)] pointer-events-none"></div>
      </div>
    </div>
  );
};

/**
 * FlipBoardDate component
 * A retro airport-style flipboard date display.
 */
export default function FlipBoardDate({ config, isVisible }: SectionProps) {
  const containerRef = useStickyScrollRef();
  const [triggered, setTriggered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef as React.RefObject<HTMLElement>, // Cast needed due to React 19 types
    offset: ['start start', 'end end']
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 0.5 && !triggered) {
      setTriggered(true);
    } else if (latest < 0.5 && triggered) {
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
    <section className="relative w-full h-full bg-[#333333] flex items-center justify-center p-6">
      {/* Outer 3D Frame Box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-black p-8 rounded-[48px] border-[8px] border-[#ecedef] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),_inset_0_4px_10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center max-w-[400px] w-full gap-12 aspect-[4/5]"
      >
        {/* Subtle Inner Highlight for 3D Feel */}
        <div className="absolute inset-0 rounded-[40px] border border-white/20 pointer-events-none" />
        <div className="absolute -inset-[8px] rounded-[48px] border border-black/10 pointer-events-none" />
        {/* Date Row: YY / MM / DD */}
        <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">DATE (YY / MM / DD)</span>
            <div className="flex gap-2 items-center justify-center w-full">
                <FlipUnit label="" value={year[0]} triggered={triggered} />
                <FlipUnit label="" value={year[1]} triggered={triggered} />
                <span className="text-white/20 px-1">/</span>
                <FlipUnit label="" value={month[0]} triggered={triggered} />
                <FlipUnit label="" value={month[1]} triggered={triggered} />
                <span className="text-white/20 px-1">/</span>
                <FlipUnit label="" value={day[0]} triggered={triggered} />
                <FlipUnit label="" value={day[1]} triggered={triggered} />
            </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-white/20"></div>

        {/* Time Row: DOW */}
        <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">DAY</span>
            <div className="flex gap-2 items-center justify-center w-full">
                <FlipUnit label="" value={dayName[0]} triggered={triggered} isWide />
                <FlipUnit label="" value={dayName[1]} triggered={triggered} isWide />
                <FlipUnit label="" value={dayName[2]} triggered={triggered} isWide />
            </div>
        </div>

         {/* Time Row: HH : MM */}
         <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">TIME</span>
            <div className="flex gap-2 items-center justify-center w-full">
                <FlipUnit label="" value={hours[0]} triggered={triggered} />
                <FlipUnit label="" value={hours[1]} triggered={triggered} />
                <span className="text-white/20 px-1 text-2xl font-mono animate-pulse">:</span>
                <FlipUnit label="" value={minutes[0]} triggered={triggered} />
                <FlipUnit label="" value={minutes[1]} triggered={triggered} />
            </div>
        </div>
      </motion.div>
    </section>
  );
}
