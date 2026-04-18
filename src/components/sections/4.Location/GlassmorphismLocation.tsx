'use client';

import { SectionProps } from '@/types/wedding';
import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll, Variants } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import Image from 'next/image';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { LiquidGlassWidget } from '@/components/ui/LiquidGlassWidget';

export default function GlassmorphismLocation({ isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const { scrollYProgress: inViewProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'start start']
  });
  
  const [isRevealed, setIsRevealed] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  
  useMotionValueEvent(inViewProgress, "change", (latest) => {
    if (latest > 0.3) setIsRevealed(true);
    else setIsRevealed(false);

    if (latest > 0.1) setShowTitle(true);
    else setShowTitle(false);
  });



  const transportation = [ 
    { title: "지하철", content: "2호선 강남역 1번 출구 도보 5분", icon: "/test-resources/location/subway.svg" },
    { title: "버스", content: "146, 341, 740, 421 하차", icon: "/test-resources/location/bus.svg" },
    { title: "자가용", content: "네비게이션 '서울 웨딩홀' 검색", sub: "(주차 2시간 무료)", icon: "/test-resources/location/car.svg" }
  ];

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

  if (!isVisible) return null;

  return (
    <section ref={scrollRef} className="relative w-full min-h-[100svh] flex flex-col items-center justify-center py-20 overflow-hidden">


      {/* Header Title Layer */}
      <motion.div
         initial={{ opacity: 0, y: 50 }}
         animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 50 }}
         transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
         style={{ scale: 0.55, transformOrigin: "top center" }}
         className="w-full flex flex-col items-center z-30 pointer-events-none mb-10 shrink-0"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-3 mb-4 opacity-30">
            <div className="w-8 h-[0.5px] bg-black" />
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-black/80">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <div className="w-8 h-[0.5px] bg-black" />
          </div>
          <Typography className="font-serif text-[1.6rem] tracking-[0.15em] text-black/80 font-medium">오시는 길</Typography>
          <Typography className="text-[0.6rem] tracking-[0.4em] text-black/40 mt-3 font-light uppercase opacity-80">Location Details</Typography>
        </div>
      </motion.div>

      <div className="w-full max-w-[320px] px-8 flex flex-col items-center justify-center z-10 gap-10 shrink-0">
        {/* Map Image Section - Added opacity adjustment */}
        <motion.div
          initial="hidden"
          animate={isRevealed ? "visible" : "hidden"}
          variants={fadeInUp}
          custom={1}
          className="w-[85%] max-w-[320px] shrink-0"
        >
          <LiquidGlassWidget 
            className="p-2.5 rounded-2xl w-full"
            scrollProgress={inViewProgress}
          >
            <div className="relative w-full overflow-hidden rounded-xl bg-transparent opacity-80 transition-opacity hover:opacity-100">
              <Image 
                src="/test-resources/location/wedding-hall.png" 
                alt="Map" 
                width={500}
                height={312}
                className="w-full h-auto object-cover" 
              />
            </div>
          </LiquidGlassWidget>
        </motion.div>

        {/* Transportation Info Section - standardized markup */}
        <div className="w-full max-w-[320px] flex flex-col items-center justify-center space-y-6">
          {transportation.map((info, idx) => (
            <div key={info.title} className="flex items-center space-x-6 w-full">
              <motion.div
                initial="hidden"
                animate={isRevealed ? "visible" : "hidden"}
                variants={fadeInUp}
                custom={2 + idx}
              >
                <LiquidGlassWidget 
                  className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                  scrollProgress={inViewProgress}
                >
                  <Image src={info.icon} alt={info.title} width={24} height={24} className="opacity-40" />
                </LiquidGlassWidget>
              </motion.div>

              <motion.div 
                initial="hidden"
                animate={isRevealed ? "visible" : "hidden"}
                variants={fadeInUp}
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

        {/* Minimized Navigation Buttons */}
        <motion.div 
          initial="hidden"
          animate={isRevealed ? "visible" : "hidden"}
          variants={fadeInUp}
          custom={5}
          className="w-full flex justify-center gap-4 mt-2"
        >
          <LiquidGlassWidget 
            variant="dock"
            className="px-5 py-2.5 rounded-full flex items-center justify-center transition-all hover:scale-105"
            scrollProgress={inViewProgress}
            onClick={() => window.open('https://map.kakao.com')}
          >
             <span className="text-[0.6rem] font-black text-black/40 tracking-[0.2em] uppercase">Kakao</span>
          </LiquidGlassWidget>
          <LiquidGlassWidget 
            variant="dock"
            className="px-5 py-2.5 rounded-full flex items-center justify-center transition-all hover:scale-105"
            scrollProgress={inViewProgress}
            onClick={() => window.open('https://map.naver.com')}
          >
             <span className="text-[0.6rem] font-black text-black/40 tracking-[0.2em] uppercase">Naver</span>
          </LiquidGlassWidget>
        </motion.div>
      </div>
    </section>
  );
}
