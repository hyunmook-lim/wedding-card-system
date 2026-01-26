'use client';

import { SectionProps } from '@/types/wedding';
import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, Variants } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import Image from 'next/image';
import { useTitleAnimation } from '@/hooks/useTitleAnimation';

export default function MemoLocation({ isVisible }: SectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { animationState: baseState, titleVariants: baseTitleVariants, scrollYProgress, variantConfig } = useTitleAnimation();
  
  // 추가 상태: info (0.50 이상)
  const [isInfo, setIsInfo] = useState(false);
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsInfo(latest > 0.50);
  });

  const animationState = isInfo ? 'info' : baseState;

  // titleVariants에 info 상태 추가 (top과 동일한 위치 유지)
  const titleVariants: Variants = {
    ...baseTitleVariants,
    info: {
      ...variantConfig.top,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const mapVariants: Variants = {
    hidden: { 
      x: "-100%",
      transition: { duration: 0.8, ease: "easeInOut" }
    },
    visible: { 
      x: "-100%",
      transition: { duration: 0.8, ease: "easeInOut" }
    },
    top: { 
      x: 0,
      transition: { duration: 0.8, ease: "easeInOut" }
    },
    info: {
      x: 0,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const infoVariants: Variants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: "100%", opacity: 0 },
    top: { x: "100%", opacity: 0 },
    info: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeInOut" 
      }
    }
  };

  if (!isVisible) return null;

  return (
    <section ref={containerRef} className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-[#fffdf7] overflow-hidden perspective-[1000px]">
        {/* Title Layer */}
        <motion.div
           initial="hidden"
           animate={animationState}
           variants={titleVariants}
           className="absolute z-20 text-center"
        >
             <Typography variant="display">
                 오시는 길
             </Typography>
        </motion.div>

        {/* Sliding Map Layer */}
        <motion.div
          initial="hidden"
          animate={animationState}
          variants={mapVariants}
          className="absolute left-0 top-[75px] w-2/3 z-10 bg-transparent"
        >
           <div className="relative w-full rounded-r-2xl overflow-hidden bg-transparent">
             <Image 
               src="/test-resources/location/wedding-hall.png" 
               alt="Map" 
               width={800}
               height={600}
               className="w-full h-auto object-cover" 
             />
           </div>
        </motion.div>

        {/* Transportation Info Layer */}
        <motion.div
          initial="hidden"
          animate={animationState}
          variants={infoVariants}
          className="absolute right-0 bottom-[40px] w-2/3 z-20 text-right pr-6 space-y-6"
        >
           <div className="flex flex-col items-end">
             <Typography variant="h3" className="mb-2 text-base text-[rgb(255,182,193)]">지하철</Typography>
             <Typography variant="body" className="text-sm">2호선 강남역 1번 출구 도보 5분</Typography>
           </div>
           <div className="flex flex-col items-end">
             <Typography variant="h3" className="mb-2 text-base text-[rgb(255,182,193)]">버스</Typography>
             <Typography variant="body" className="text-sm">146, 341, 740, 421 하차</Typography>
           </div>
           <div className="flex flex-col items-end">
             <Typography variant="h3" className="mb-2 text-base text-[rgb(255,182,193)]">자가용</Typography>
             <Typography variant="body" className="text-sm">네비게이션 &apos;서울 웨딩홀&apos; 검색</Typography>
             <Typography variant="caption" className="mt-1">(주차 2시간 무료)</Typography>
           </div>
        </motion.div>
      </div>
    </section>
  );
}
