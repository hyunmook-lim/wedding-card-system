'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useScroll, useTransform, motion, useMotionValueEvent } from 'framer-motion';
import { SectionProps } from '@/types/wedding';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/Typography';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import Image from 'next/image';

export default function VideoGreeting({ config, isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentIndexRef = useRef(0);
  
  // Extract config
  const images = useMemo(() => (config.images as string[]) || [], [config.images]);
  
  // Height multiplier for scroll distance

  const { scrollYProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start start', 'end end'],
  });

  // Entry phase: When the sticky container enters the view
  const { scrollYProgress: scrollYEnter } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'start start'],
  });

  // Exit phase: When the sticky container scrolls out of view (after 'end end')
  const { scrollYProgress: scrollYExit } = useScroll({
    target: scrollRef || undefined,
    offset: ['end end', 'end start'],
  });

  const scriptPhrases = [
    "어느 한 단어로 정의하기엔\n너무 예쁘고",
    "세상에 존재하지 않는 단어일지 모를\n귀한 감정들에",
    "차마 이름을 붙이지 못하고\n8년의 시간을 흘려보내게 해준",
    "소중한 사람을 만나 결혼합니다."
  ];

  const [activePhraseIndex, setActivePhraseIndex] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Trigger animations based on specific scroll points
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollPosition(latest);
    if (latest >= 0.05 && latest < 0.20) setActivePhraseIndex(0);
    else if (latest >= 0.20 && latest < 0.35) setActivePhraseIndex(1);
    else if (latest >= 0.35 && latest < 0.60) setActivePhraseIndex(2);
    else if (latest >= 0.60 && latest < 0.95) setActivePhraseIndex(3);
    else setActivePhraseIndex(null);
  });

  const getPhraseState = (idx: number) => {
    if (activePhraseIndex === null) {
      return scrollPosition < 0.05 ? 'upcoming' : 'past';
    }
    if (activePhraseIndex === idx) return 'visible';
    if (activePhraseIndex < idx) return 'upcoming';
    return 'past';
  };

  const phraseVariants = {
    upcoming: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    past: { opacity: 0, y: -20 }
  };

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Effects trigger during both entry and exit phases
  const containerOpacity = useTransform(
    [scrollYEnter, scrollYExit],
    ([enter, exit]: number[]) => {
      if (enter < 1) return enter;
      if (exit > 0) return 1 - exit;
      return 1;
    }
  );

  const containerBlur = useTransform(
    [scrollYEnter, scrollYExit],
    ([enter, exit]: number[]) => {
      if (enter < 1) return `blur(${(1 - enter) * 10}px)`;
      if (exit > 0) return `blur(${exit * 10}px)`;
      return "blur(0px)";
    }
  );

  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Preload images
  useEffect(() => {
    if (!images || images.length === 0) {
      setIsLoading(false);
      return;
    }

    let loadedCount = 0;
    const imgElements: HTMLImageElement[] = [];

    // Begin loading
    images.forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setIsLoading(false);
        }
      };
      // If error, we still count it or handle it? Simple approach for now.
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === images.length) setIsLoading(false);
      }
      imgElements.push(img);
    });

    setLoadedImages(imgElements);
  }, [images]);

  // Render loop & Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadedImages.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (index: number) => {
      currentIndexRef.current = index;
      const img = loadedImages[index];
      if (!img) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      if (canvasWidth === 0 || canvasHeight === 0) return;

      const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
      
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;
      
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        render(currentIndexRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const initialProgress = scrollYProgress.get();
    const initialIndex = Math.min(
      Math.floor(initialProgress * (loadedImages.length - 1)),
      loadedImages.length - 1
    );
    render(initialIndex);

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const index = Math.min(
        Math.floor(latest * (loadedImages.length - 1)),
        loadedImages.length - 1
      );
      requestAnimationFrame(() => render(index));
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
    };
  }, [loadedImages, scrollYProgress]);

  // 스크롤 시작 감지
  useEffect(() => {
    if (scrollYProgress.get() > 0.01 && !hasScrolled) {
      setHasScrolled(true);
    }
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest > 0.01 && !hasScrolled) {
        setHasScrolled(true);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, hasScrolled]);

  if (!isVisible) return null;

  return (
    <div ref={containerRef} className={cn("relative w-full h-full")}>
      <motion.div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden bg-white"
        style={{ 
          opacity: containerOpacity,
          filter: containerBlur,
          willChange: "opacity, filter"
        }}
      >
        {images.length > 0 ? (
          <>
            {/* 첫 번째 이미지 - 스크롤 전에 항상 표시 */}
            <div className={cn(
              "absolute inset-0 transition-opacity duration-300",
              hasScrolled ? "opacity-0" : "opacity-100"
            )}>
              <Image
                src={images[0]}
                alt="First frame"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            {/* 캔버스 - 스크롤 시작 후 표시 */}
            <canvas 
              ref={canvasRef} 
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                hasScrolled ? "opacity-100" : "opacity-0"
              )}
            />
          </>
        ) : (
           <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
             <p>[VideoGreeting] 설정된 이미지가 없습니다.</p>
           </div>
        )}

        {/* Chronological Script Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none pb-40">
          {scriptPhrases.map((phrase, idx) => (
            <motion.div 
              key={idx}
              variants={phraseVariants}
              initial={false}
              animate={getPhraseState(idx)}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute text-center text-white px-8 w-full max-w-[400px]"
            >
              <Typography 
                className="font-serif italic text-[1.1rem] leading-relaxed tracking-[0.05em] text-white/90 break-keep drop-shadow-md whitespace-pre-line"
              >
                {phrase}
              </Typography>
            </motion.div>
          ))}
        </div>
        
        {/* Scroll Hint */}
        <motion.div 
            style={{ opacity: scrollHintOpacity, willChange: "opacity" }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
            <ScrollIndicator color="#ffffff" text="Scroll Down" />
        </motion.div>
      </motion.div>
    </div>
  );
}
