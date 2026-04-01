'use client';

import { SectionProps } from '@/types/wedding';
import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, Variants } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import Image from 'next/image';
import { useTitleAnimation } from '@/hooks/useTitleAnimation';
import { cn } from '@/lib/utils';
import { IconWrapper } from '@/components/ui/IconWrapper';

const Icons = {
  Subway: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="16" x="4" y="3" rx="2" />
      <path d="M4 11h16" />
      <path d="M12 3v8" />
      <path d="m8 19-2 3" />
      <path d="m18 22-2-3" />
      <path d="M8 15h.01" />
      <path d="M16 15h.01" />
    </svg>
  ),
  Bus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6" />
      <path d="M15 6v6" />
      <path d="M2 12h19.6" />
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2C.5 16.3 1 18 1 18h3" />
      <path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  ),
  Car: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
};

export default function MemoLocation({ isVisible }: SectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { animationState, titleVariants, scrollYProgress } = useTitleAnimation({
    thresholds: {
      visible: 0.25,
      top: 0.35,
    },
    variants: {
      top: { y: '-340px', opacity: 1, scale: 0.55 }
    }
  });
  
  const [isRevealed, setIsRevealed] = useState(false);
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.50) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  });

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.15,
        duration: 0.8, 
        ease: [0.215, 0.61, 0.355, 1.0] 
      }
    })
  };

  // Phase 2: Neumorphic shadow pops out SIMULTANEOUSLY for all items
  const containerShadowVariants: Variants = {
    hidden: { 
      boxShadow: "0px 0px 0px rgba(217, 215, 210, 0), 0px 0px 0px rgba(255, 255, 255, 0)"
    },
    visible: (i: number) => ({
      boxShadow: "6px 6px 16px #d9d7d2, -8px -8px 20px #ffffff",
      transition: { 
        // 딜레이에서 인덱스(i)를 제거하여 모든 그림자가 동시에 나타나도록 함
        delay: 1.2, 
        duration: 1.2,
        ease: "easeInOut"
      }
    })
  };

  // Phase 1: All content (icon + text) fades in sequentially
  const contentFadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: { 
        delay: i * 0.2,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };

  if (!isVisible) return null;

  return (
    <section ref={containerRef} className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center overflow-hidden perspective-[1000px]">
        
        {/* Title Layer */}
        <motion.div
           initial="hidden"
           animate={animationState}
           variants={titleVariants}
           className="absolute z-20 text-center w-full px-4"
           style={{ willChange: "transform, opacity" }}
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
                 오시는 길
               </Typography>
               
               <Typography 
                 className="text-[0.6rem] tracking-[0.4em] text-black/40 mt-3 font-light uppercase opacity-80"
               >
                 Location Details
               </Typography>
             </div>
        </motion.div>

        {/* Map Image Layer */}
        <motion.div
          initial="hidden"
          animate={isRevealed ? "visible" : "hidden"}
          variants={fadeInUp}
          custom={1}
          className="absolute top-[220px] w-[65%] z-10 flex justify-center"
        >
           <div className="relative w-full rounded-2xl overflow-hidden bg-transparent">
             <Image 
               src="/test-resources/location/wedding-hall.png" 
               alt="Map" 
               width={500}
               height={312}
               className="w-full h-auto object-cover opacity-90" 
             />
           </div>
        </motion.div>

        {/* Transportation Info Layer - 1단계(차례대로 페이드인) -> 2단계(동시에 그림자 생성) */}
        <div className="absolute top-[600px] w-full px-8 z-20 flex flex-col items-center space-y-7">
           {[ 
             { title: "지하철", content: "2호선 강남역 1번 출구 도보 5분", icon: <Icons.Subway /> },
             { title: "버스", content: "146, 341, 740, 421 하차", icon: <Icons.Bus /> },
             { title: "자가용", content: "네비게이션 '서울 웨딩홀' 검색", sub: "(주차 2시간 무료)", icon: <Icons.Car /> }
           ].map((info, idx) => (
             <div
               key={info.title}
               className="flex items-center space-x-6 w-full max-w-[280px]"
             >
                {/* 2단계: 박스 그림자 (인덱스 상관없이 동시에 실행) */}
                <motion.div 
                  initial="hidden"
                  animate={isRevealed ? "visible" : "hidden"}
                  variants={containerShadowVariants}
                  custom={2 + idx}
                  className={cn(
                    "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center",
                    "bg-[#fffdf7] text-black/40",
                    "relative overflow-hidden"
                  )}
                  style={{ willChange: "box-shadow" }}
                >
                  {/* 1단계: 아이콘 페이드인 (차례대로 실행) */}
                  <motion.div
                    initial="hidden"
                    animate={isRevealed ? "visible" : "hidden"}
                    variants={contentFadeVariants}
                    custom={2 + idx}
                  >
                    <IconWrapper size={24}>
                      {info.icon}
                    </IconWrapper>
                  </motion.div>
                </motion.div>

                {/* 1단계: 텍스트 페이드인 (차례대로 실행) */}
                <motion.div 
                  initial="hidden"
                  animate={isRevealed ? "visible" : "hidden"}
                  variants={contentFadeVariants}
                  custom={2 + idx}
                  className="flex flex-col"
                >
                  <Typography className="text-[0.6rem] font-extrabold text-black/20 uppercase tracking-[0.2em] mb-1">
                    {info.title}
                  </Typography>
                  <Typography variant="body" className="text-[0.85rem] text-black/80 font-semibold leading-tight">
                    {info.content}
                  </Typography>
                  {info.sub && (
                    <Typography className="text-[0.65rem] text-black/40 mt-1 font-light tracking-wide italic">
                      {info.sub}
                    </Typography>
                  )}
                </motion.div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
