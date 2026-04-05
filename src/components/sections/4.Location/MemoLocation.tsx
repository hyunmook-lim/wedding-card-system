'use client';

import { SectionProps } from '@/types/wedding';
import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, Variants } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import Image from 'next/image';
import { useTitleAnimation } from '@/hooks/useTitleAnimation';
import { cn } from '@/lib/utils';
// IconWrapper import removed as it is no longer used for external SVG images.

// Icons object removed as we are now using external SVG assets.

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
    if (latest > 0.35) {
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
        delay: 0.8 + i * 0.15,
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
    visible: () => ({
      boxShadow: "6px 6px 12px #d1cfc9, -6px -6px 12px #ffffff",
      transition: { 
        delay: 0.8 + 1.2, 
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
        delay: 0.8 + i * 0.2,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };

  if (!isVisible) return null;

  return (
    <section ref={containerRef} className="relative w-full h-[100dvh]">
      <div className="absolute top-0 left-0 w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden perspective-[1000px]">

        
        
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

        {/* Combined Content Layer (Map + Info) */}
        <div 
          className="absolute top-[120px] bottom-0 w-full flex flex-col items-center justify-center py-6 px-8 z-10 gap-10"
        >
          {/* Map Image Section */}
          <motion.div
            initial="hidden"
            animate={isRevealed ? "visible" : "hidden"}
            variants={fadeInUp}
            custom={1}
            className="w-[75%] max-w-[320px] shrink-0"
          >
             <motion.div
               initial="hidden"
               animate={isRevealed ? "visible" : "hidden"}
               variants={containerShadowVariants}
               className={cn(
                 "p-2.5 rounded-2xl w-full",
                 "bg-[#e8e8e8]"
               )}
               style={{ willChange: "box-shadow" }}
             >
               <div className="relative w-full overflow-hidden rounded-xl bg-transparent">
                 <Image 
                   src="/test-resources/location/wedding-hall.png" 
                   alt="Map" 
                   width={500}
                   height={312}
                   className="w-full h-auto object-cover" 
                 />
               </div>
             </motion.div>
          </motion.div>

          {/* Transportation Info Section */}
          <div className="w-full flex-1 flex flex-col items-center justify-center space-y-6 max-h-[400px]">
             {[ 
               { title: "지하철", content: "2호선 강남역 1번 출구 도보 5분", icon: "/test-resources/location/subway.svg" },
               { title: "버스", content: "146, 341, 740, 421 하차", icon: "/test-resources/location/bus.svg" },
               { title: "자가용", content: "네비게이션 '서울 웨딩홀' 검색", sub: "(주차 2시간 무료)", icon: "/test-resources/location/car.svg" }
             ].map((info, idx) => (
               <div
                 key={info.title}
                 className="flex items-center space-x-6 w-full max-w-[280px]"
               >
                  {/* Phase 2: Neumorphic shadow */}
                  <motion.div 
                    initial="hidden"
                    animate={isRevealed ? "visible" : "hidden"}
                    variants={containerShadowVariants}
                    className={cn(
                      "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center",
                      "bg-[#e8e8e8] text-black/40",
                      "relative"
                    )}
                    style={{ willChange: "box-shadow" }}
                  >
                    {/* Phase 1: Icon Fade */}
                    <motion.div
                      initial="hidden"
                      animate={isRevealed ? "visible" : "hidden"}
                      variants={contentFadeVariants}
                      custom={2 + idx}
                    >
                      <Image
                        src={info.icon}
                        alt={info.title}
                        width={24}
                        height={24}
                        className="opacity-40"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Phase 1: Text Fade */}
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
      </div>
    </section>
  );
}
