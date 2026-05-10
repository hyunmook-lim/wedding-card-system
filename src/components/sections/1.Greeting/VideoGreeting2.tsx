'use client';

import { useRef, useEffect, useState } from 'react';
import { SectionProps } from '@/types/wedding';
import { cn } from '@/lib/utils';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';

export default function VideoGreeting2({ isVisible }: SectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useStickyScrollRef();

  const { scrollYProgress } = useScroll({
    target: scrollRef as React.RefObject<HTMLElement> | undefined,
    offset: ['start start', 'end start'],
  });

  // 스크롤 시 빠른 속도로 투명도 및 블러 처리
  const videoOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const videoBlur = useTransform(scrollYProgress, [0, 0.3], ['blur(0px)', 'blur(20px)']);
  
  // 스크롤 다운 힌트는 스크롤 시작 즉시(더 빨리) 사라짐
  const hintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setHasStarted(true);

    video.addEventListener('play', handlePlay);

    // MainIntro가 페이드아웃(1.2초)으로 완전히 사라진 후 재생되도록 딜레이 추가
    const timer = setTimeout(() => {
      video.play().catch((err) => console.warn("Video auto-play delayed error:", err));
    }, 1200);

    return () => {
      video.removeEventListener('play', handlePlay);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={cn("relative w-full h-[100lvh] bg-transparent overflow-hidden")}>
      <motion.div 
        className="absolute inset-0 w-full h-full bg-white"
        style={{ opacity: videoOpacity, filter: videoBlur, willChange: 'opacity, filter' }}
      >
        <video
          ref={videoRef}
          src="/test-resources/video.mp4"
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      {/* Scroll Hint */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        style={{ opacity: hintOpacity, willChange: 'opacity' }}
      >
        <AnimatePresence>
          {hasStarted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <ScrollIndicator color="#333333" text="Scroll Down" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
