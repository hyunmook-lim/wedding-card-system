'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { SectionProps } from '@/types/wedding';

export default function BasicIntro({ config, isVisible, onEnter, isPreloading, loadingProgress }: SectionProps) {
  const { groom, bride } = config as { groom?: string; bride?: string };
  const text = `${groom || '신랑'} & ${bride || '신부'}\n결혼식에 초대합니다🕊️`;
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // 최소 3.2초 대기 (애니메이션이 끝날 때까지)
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3200);
    return () => clearTimeout(minTimer);
  }, []);

  // 상태를 파생시켜 불필요한 useEffect 내 setState 호출 방지
  const showContent = isPreloading || !minTimeElapsed;

  useEffect(() => {
    // 로딩과 보장 시간이 모두 끝났을 때만 onEnter 호출
    if (!showContent && onEnter) {
      const exitTimer = setTimeout(onEnter, 800);
      return () => clearTimeout(exitTimer);
    }
  }, [showContent, onEnter]);

  // Framer motion variants
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.3 },
    },
    exit: { opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  if (!isVisible) return null;

  return (
    <section className="w-full h-[100dvh] flex flex-col items-center justify-center bg-white relative overflow-hidden">
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="flex flex-col items-center z-10 w-full px-6"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={container}
          >
            {/* Animated Text */}
            <div className="flex flex-wrap justify-center mb-12 overflow-hidden text-xl md:text-2xl font-light text-gray-800 tracking-wider text-center leading-relaxed whitespace-pre-wrap">
              {Array.from(text).map((letter, index) => {
                if (letter === '\n') {
                  return <div key={index} className="w-full h-2" />;
                }
                return (
                  <motion.span
                    key={index}
                    variants={child}
                    className={letter === ' ' ? 'w-[0.3em]' : 'inline-block'}
                  >
                    {letter}
                  </motion.span>
                );
              })}
            </div>

            {/* Loading Bar */}
            <motion.div 
              className="w-48 h-[2px] bg-gray-100 rounded-full overflow-hidden mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.div
                className="h-full bg-gray-800 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress || 0}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </motion.div>
            
            <motion.div 
              className="mt-4 text-[10px] text-gray-400 font-light tracking-[0.2em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {isPreloading ? '초대장을 준비하고 있습니다' : '준비 완료'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
