'use client';

import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, Variants } from 'framer-motion';
import { SectionProps } from '@/types/wedding';
import { Typography } from '@/components/ui/Typography';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { LiquidGlassWidget } from '@/components/ui/LiquidGlassWidget';
import Image from 'next/image';

/* ─────────────────────────────────────────────────────────────────────────────
   GlassmorphismMemories: Refined for Harmony.
   Matches the premium design pattern and scroll-triggered reveal behavior
   of the project's other glassmorphism components.
   ───────────────────────────────────────────────────────────────────────────── */

export default function GlassmorphismMemories({ isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const { scrollYProgress: inViewProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'start start']
  });

  const [showTitle, setShowTitle] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({
    m0: false,
    m1: false,
    m2: false,
    m3: false
  });

  useMotionValueEvent(inViewProgress, "change", (latest) => {
    setShowTitle(latest > 0.15);
    setRevealed({
      m0: latest > 0.35,
      m1: latest > 0.50,
      m2: latest > 0.65,
      m3: latest > 0.80
    });
  });

  if (!isVisible) return null;

  const milestones = [
    { 
      id: 'start', 
      date: '2018년 05월 27일', 
      title: '설레었던 우리의 시작', 
      image: '/test-resources/memories/1.jpeg'
    },
    { 
      id: 'period', 
      date: '연애기간 2982일', 
      title: '울고 웃었던\n8년간의 장거리 연애',
      image: '/test-resources/memories/2.jpeg'
    },
    { 
      id: 'promise', 
      date: '2025. 04. 12', 
      title: 'Will you marry me?', 
      image: '/test-resources/memories/3.jpeg'
    },
    { 
      id: 'forever', 
      date: '2026. 07. 25', 
      title: '평생을 약속하는 오늘', 
      image: '/test-resources/memories/4.jpeg'
    }
  ];

  const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.215, 0.61, 0.355, 1.0] 
      }
    }
  };

  const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.215, 0.61, 0.355, 1.0] 
      }
    }
  };

  return (
    <section ref={scrollRef} className="relative w-full py-24 flex flex-col items-center justify-center overflow-hidden bg-transparent">
      
      {/* ── Header Title Layer (Harmonized) ── */}
      <motion.div
         initial={{ opacity: 0, y: 50 }}
         animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 50 }}
         transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
         style={{ scale: 0.55, transformOrigin: "top center" }}
         className="w-full flex flex-col items-center z-30 pointer-events-none mb-6 shrink-0"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-3 mb-4 opacity-30">
            <div className="w-8 h-[0.5px] bg-black" />
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-black/80">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.71L12 14.44l-3.29 2.27.83-3.84-2.93-2.54 3.91-.32L12 6.41l1.51 3.6 3.91.32-2.93 2.54.83 3.84z"/>
            </svg>
            <div className="w-8 h-[0.5px] bg-black" />
          </div>
          <Typography className="font-serif text-[1.6rem] tracking-[0.15em] text-black/80 font-medium">오늘에 닿기까지의 시간들</Typography>
          <Typography className="text-[0.6rem] tracking-[0.4em] text-black/40 mt-3 font-light uppercase opacity-80">Our Journey & Story</Typography>
        </div>
      </motion.div>

      {/* ── Timeline Container ── */}
      <div className="w-full max-w-[360px] px-6 flex flex-col items-center justify-center z-10">
        
        {/* Central Vertical Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-black/[0.03] z-0" />

        {/* Milestones Content */}
        <div className="w-full space-y-16">
          {milestones.map((m, idx) => {
            const isLeft = idx % 2 === 0;
            const isItemRevealed = revealed[`m${idx}`];
            
            return (
              <div key={m.id} className="relative w-full flex items-center justify-between min-h-[100px] z-10">
                
                {/* ── Content Wrapper ── */}
                <div className={`flex items-center w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                  
                  {/* Icon Side */}
                  <div className="w-1/2 flex items-center justify-center">
                    <motion.div
                      initial="hidden"
                      animate={isItemRevealed ? "visible" : "hidden"}
                      variants={isLeft ? fadeInLeft : fadeInRight}
                    >
                      <LiquidGlassWidget 
                        variant="default"
                        className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-md overflow-hidden bg-white/10"
                        containerClassName="w-full h-full"
                      >
                        <div className="relative w-full h-full p-2">
                          <div className="relative w-full h-full overflow-hidden rounded-2xl">
                            <Image 
                              src={m.image} 
                              alt={m.title}
                              fill
                              sizes="(max-width: 430px) 112px, 112px"
                              className="object-cover opacity-90 transition-opacity hover:opacity-100"
                              priority={idx < 2}
                            />
                          </div>
                        </div>
                      </LiquidGlassWidget>
                    </motion.div>
                  </div>

                  {/* Spacer for Line/Dot */}
                  <div className="relative flex-shrink-0 w-8 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={isItemRevealed ? { scale: 1 } : { scale: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="w-2.5 h-2.5 rounded-full bg-white border border-amber-400/30 shadow-sm z-20"
                    />
                  </div>

                  {/* Text Side */}
                  <div className={`w-1/2 flex flex-col ${isLeft ? 'items-start pl-4 text-left' : 'items-end pr-4 text-right'}`}>
                    <motion.div
                      initial="hidden"
                      animate={isItemRevealed ? "visible" : "hidden"}
                      variants={isLeft ? fadeInRight : fadeInLeft}
                    >
                      <Typography className="text-[0.6rem] font-extrabold text-black/20 uppercase tracking-[0.2em] mb-1">
                        {m.date}
                      </Typography>
                      <Typography className="text-[0.85rem] text-black/80 font-semibold leading-tight break-keep whitespace-pre-line">
                        {m.title}
                      </Typography>
                    </motion.div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hospitality Message (Harmonized pattern) */}
      <motion.div
        initial="hidden"
        animate={revealed.m3 ? "visible" : "hidden"}
        variants={fadeInLeft}
        className="flex flex-col items-center w-full text-center mt-20 px-6 opacity-60"
      >
        <div className="w-6 h-[0.5px] bg-black/10 mb-6" />
        <Typography className="text-[0.75rem] font-serif italic text-black/50 leading-relaxed break-keep">
          아끼는 마음들을 모아<br/>
          함께하는 발걸음마다 축복을 더해주시는<br/>
          모든 분들께 감사의 인사를 전합니다.
        </Typography>
        <div className="w-1.5 h-1.5 rounded-full bg-black/5 mt-6" />
      </motion.div>

    </section>
  );
}
