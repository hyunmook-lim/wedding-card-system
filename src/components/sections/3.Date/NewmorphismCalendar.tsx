import { SectionProps } from '@/types/wedding';
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValueEvent, Variants, useScroll, AnimatePresence } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { cn } from '@/lib/utils';

const FlipUnit = ({ value, triggered, delay = 0, isWide = false }: { value: string; triggered: boolean; delay?: number; isWide?: boolean }) => {
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

    const sessionId = ++animationSessionRef.current;
    let initialTimeoutId: NodeJS.Timeout;
    const activeTimeouts: NodeJS.Timeout[] = [];

    const startAnimation = () => {
      if (sessionId !== animationSessionRef.current) return;

      const chars = isWide ? ' ABCDEFGHIJKLMNOPQRSTUVWXYZ-+0123456789' : ' 0123456789-+D';
      const startIndex = chars.indexOf(currentValueRef.current);
      const targetIndex = chars.indexOf(targetChar);
      
      if (startIndex === -1 || targetIndex === -1) return;

      const sequence: string[] = [];
      const steps = (targetIndex - startIndex + chars.length) % chars.length;
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

  const widthClass = "w-[24px] sm:w-[28px]"; 
  const heightClass = "h-10 sm:h-12"; 
  const fontSizeClass = "text-xl sm:text-2xl"; 

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative rounded-md ${widthClass} ${heightClass} flex flex-col overflow-hidden shadow-md border border-black/10 bg-[#2a2a2a]`}
        style={{ perspective: '400px' }}
      >
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#363636] overflow-hidden border-b border-black/20">
           <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className={`${fontSizeClass} font-mono text-white/90 leading-none`}>{nextValue}</span>
           </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#2a2a2a] overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className={`${fontSizeClass} font-mono text-white/90 leading-none`}>{currentValue}</span>
           </div>
        </div>

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
              <div 
                 className="absolute inset-0 w-full h-full overflow-hidden border-b border-black/20 rounded-t-md"
                 style={{ 
                   backgroundColor: '#363636',
                   backfaceVisibility: 'hidden',
                   WebkitBackfaceVisibility: 'hidden'
                 }}
              >
                 <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className={`${fontSizeClass} font-mono text-white/90 leading-none`}>{currentValue}</span>
                 </div>
              </div>
              
              <div 
                 className="absolute inset-0 w-full h-full overflow-hidden rounded-b-md border-b border-black/5"
                 style={{ 
                   backgroundColor: '#2a2a2a',
                   backfaceVisibility: 'hidden',
                   WebkitBackfaceVisibility: 'hidden',
                   transform: 'rotateX(180deg)'
                 }}
              >
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className={`${fontSizeClass} font-mono text-white/90 leading-none`}>{nextValue}</span>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-black/40 z-30 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default function NewmorphismCalendar({ config, isVisible }: SectionProps) {
  const { date: dateStr } = config;
  const weddingDate = new Date(dateStr as string);
  
  const scrollRef = useStickyScrollRef();
  const { scrollYProgress: inViewProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'start start']
  });
  
  const [isRevealed, setIsRevealed] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  
  useMotionValueEvent(inViewProgress, "change", (latest) => {
    // 트리거 시점을 대폭 앞당겨서 화면 아래에서 올라올 때 바로 애니메이션 시작
    if (latest > 0.2) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }

    if (latest > 0.1) {
      setShowTitle(true);
    } else {
      setShowTitle(false);
    }
  });

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.8 + i * 0.15,
        duration: 0.8, 
        ease: [0.215, 0.61, 0.355, 1.0] 
      }
    })
  };

  const containerShadowVariants: Variants = {
    hidden: { 
      boxShadow: "0px 0px 0px rgba(217, 215, 210, 0), 0px 0px 0px rgba(255, 255, 255, 0)"
    },
    visible: {
      boxShadow: "6px 6px 12px #d1cfc9, -6px -6px 12px #ffffff",
      transition: { 
        delay: 2.0, 
        duration: 1.2,
        ease: "easeInOut"
      }
    }
  };

  // Calendar logic
  const year = weddingDate.getFullYear();
  const month = weddingDate.getMonth();
  const today = weddingDate.getDate();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarDays = [];
  // Fill empty slots before the first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Fill actual days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // D-Day logic
  const now = new Date();
  const dDayDate = new Date(weddingDate);
  now.setHours(0, 0, 0, 0);
  dDayDate.setHours(0, 0, 0, 0);
  const diffTime = dDayDate.getTime() - now.getTime();
  const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (!isVisible) return null;

  return (
    <section ref={scrollRef} className="relative w-full min-h-[100svh] bg-[#e8e8e8] flex flex-col items-center justify-center py-20 overflow-hidden">
      {/* Title Layer */}
      <motion.div
         initial={{ opacity: 0, y: 50 }}
         animate={{ 
           opacity: showTitle ? 1 : 0, 
           y: showTitle ? 0 : 50 
         }}
         transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
         style={{ 
           scale: 0.55, 
           transformOrigin: "top center",
           willChange: "transform, opacity"
         }}
         className="w-full flex flex-col items-center z-30 pointer-events-none mb-6 shrink-0"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-3 mb-4 opacity-30">
            <div className="w-8 h-[0.5px] bg-black" />
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-black/80">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <div className="w-8 h-[0.5px] bg-black" />
          </div>
          
          <Typography 
            className="font-serif text-[1.6rem] tracking-[0.15em] text-black/80 font-medium py-0 px-0 border-none"
          >
            소중한 날
          </Typography>
          
          <Typography 
            className="text-[0.6rem] tracking-[0.4em] text-black/40 mt-3 font-light uppercase opacity-80"
          >
            Save The Date
          </Typography>
        </div>
      </motion.div>

      <div className="w-full max-w-[320px] px-4 flex flex-col items-center">
        {/* Calendar Month Header */}
        <motion.div
          initial="hidden"
          animate={isRevealed ? "visible" : "hidden"}
          variants={fadeInUp}
          custom={0}
          className="text-center mb-8 shrink-0"
        >
          <Typography className="text-[1.4rem] font-serif text-black/60 italic lowercase leading-none">
            {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(weddingDate)}
          </Typography>
          <Typography className="text-[0.6rem] tracking-[0.3em] text-black/30 font-bold uppercase mt-2">
            {year}
          </Typography>
        </motion.div>

        {/* Neumorphic Calendar Container */}
        <motion.div
          initial="hidden"
          animate={isRevealed ? "visible" : "hidden"}
          variants={containerShadowVariants}
          className="p-6 rounded-3xl w-full bg-[#e8e8e8] relative overflow-hidden shrink-0"
          style={{ willChange: "box-shadow" }}
        >
          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-4">
            {weekDays.map((day: string, idx: number) => (
              <div key={day} className="text-center">
                <Typography className={cn(
                  "text-[0.5rem] font-bold tracking-widest",
                  idx === 0 ? "text-red-300/60" : "text-black/20"
                )}>
                  {day}
                </Typography>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-3">
            {calendarDays.map((day: number | null, idx: number) => {
              const isWeddingDay = day === today;
              const isSunday = idx % 7 === 0;

              return (
                <div key={idx} className="flex items-center justify-center relative py-1">
                  {day !== null ? (
                    <div className="relative flex items-center justify-center w-8 h-8">
                      {isWeddingDay && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={isRevealed ? { scale: 1.1, opacity: 1 } : { scale: 0, opacity: 0 }}
                          transition={{ delay: 2.8, duration: 0.8, type: "spring" }}
                          className="absolute inset-0 rounded-full bg-[#e8e8e8] shadow-[inset_4px_4px_8px_#d1cfc9,inset_-4px_-4px_8px_#ffffff]"
                        />
                      )}
                      <Typography className={cn(
                        "text-[0.75rem] font-medium relative z-10",
                        isWeddingDay ? "text-slate-800 font-bold" : (isSunday ? "text-red-400/40" : "text-black/40")
                      )}>
                        {day}
                      </Typography>
                      {isWeddingDay && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={isRevealed ? { opacity: 0.1 } : { opacity: 0 }}
                            transition={{ delay: 3.2 }}
                            className="absolute -bottom-1 w-1 h-1 rounded-full bg-black/80"
                          />
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Time Detail & D-Day Section */}
        <div className="mt-10 text-center space-y-8 shrink-0">
          <motion.div
            initial="hidden"
            animate={isRevealed ? "visible" : "hidden"}
            variants={fadeInUp}
            custom={2}
          >
            <Typography className="text-[0.65rem] text-black/60 font-medium tracking-widest uppercase">
              {new Intl.DateTimeFormat('ko-KR', { 
                weekday: 'long', 
                hour: 'numeric', 
                minute: 'numeric',
                hour12: true 
              }).format(weddingDate)}
            </Typography>
          </motion.div>

          {/* D-Day Counter (Flip Board Design) */}
          <motion.div
            initial="hidden"
            animate={isRevealed ? "visible" : "hidden"}
            variants={fadeInUp}
            custom={3}
            className="flex flex-col items-center"
          >
              <div className="w-8 h-[0.5px] bg-black/10 mb-6" />
              <Typography className="text-[0.6rem] tracking-[0.4em] text-black/30 font-bold uppercase mb-4">
                Marriage Countdown
              </Typography>
              
              <div className="flex items-center gap-1.5">
                {(dDay > 0 ? `D-${String(dDay).padStart(2, '0')}` : dDay === 0 ? 'D-DAY' : `D+${String(Math.abs(dDay)).padStart(2, '0')}`)
                  .split('')
                  .map((char, i) => (
                    <FlipUnit 
                      key={i} 
                      value={char} 
                      triggered={isRevealed} 
                      delay={400 + i * 100}
                    />
                  ))
                }
              </div>

              <Typography className="text-[0.65rem] text-black/20 font-serif italic mt-5 tracking-[0.1em]">
                Wedding Day
              </Typography>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
