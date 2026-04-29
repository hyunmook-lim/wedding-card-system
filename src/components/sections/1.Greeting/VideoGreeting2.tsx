'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useScroll, useTransform, motion, useMotionValueEvent } from 'framer-motion';
import { SectionProps } from '@/types/wedding';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/Typography';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';

export default function VideoGreeting2({ config, isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentIndexRef = useRef(0);
  
  // Extract config or use default frames
  const images = useMemo(() => {
    if (config.images && (config.images as string[]).length > 0) {
      return config.images as string[];
    }
    // 기본적으로 video-intro_frames 사용
    return Array.from({ length: 100 }, (_, i) => `/test-resources/video-intro_frames/video-intro_${String(i + 1).padStart(3, '0')}.jpg`);
  }, [config.images]);
  
  const { scrollYProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start start', 'end end'],
  });

  const { scrollYProgress: scrollYEnter } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'start start'],
  });

  const { scrollYProgress: scrollYExit } = useScroll({
    target: scrollRef || undefined,
    offset: ['end end', 'end start'],
  });

  const scriptPhrases = [
    "어느 한 단어로 정의하기엔 너무 아름답고,",
    "세상에 존재하지 않는 단어일지 모를 귀한 감정들에",
    "차마 이름을 붙이지 못하고 온전히 느끼게 해준",
    "소중한 사람을 만나 결혼합니다."
  ];

  const thresholds = [0.15, 0.3, 0.45, 0.6];
  const [visibleIdx, setVisibleIdx] = useState(-1);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let currentIdx = -1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (latest >= thresholds[i]) {
        currentIdx = i;
        break;
      }
    }
    if (currentIdx !== visibleIdx) {
      setVisibleIdx(currentIdx);
    }
  });

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

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

  useEffect(() => {
    if (!images || images.length === 0) {
      setIsLoading(false);
      return;
    }

    let loadedCount = 0;
    const imgElements: HTMLImageElement[] = [];

    images.forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) setIsLoading(false);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === images.length) setIsLoading(false);
      }
      imgElements.push(img);
    });

    setLoadedImages(imgElements);
  }, [images]);

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

      // 좌우 여백을 주어 프레임 크기를 살짝 줄임
      const margin = 20; // 좌우 20px 여백
      const drawWidth = canvasWidth - margin * 2;
      const drawHeight = img.height * (drawWidth / img.width);
      const offsetX = margin;
      // 중앙보다 살짝 위 (캔버스 높이의 15%만큼 위로)
      const offsetY = (canvasHeight - drawHeight) / 2 - (canvasHeight * 0.15);
      
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

  const [isExiting, setIsExiting] = useState(false);
  
  useMotionValueEvent(scrollYExit, "change", (latest) => {
    if (latest > 0) setIsExiting(true);
    else setIsExiting(false);
  });

  if (!isVisible) return null;

  return (
    <div ref={containerRef} className={cn("relative w-full h-full bg-neutral-100")}>
      <motion.div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden bg-neutral-100"
        style={{ 
          opacity: containerOpacity,
          filter: containerBlur,
          willChange: "opacity, filter"
        }}
      >
        {images.length > 0 ? (
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover"
          />
        ) : (
           <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
             <p>[VideoGreeting2] 설정된 이미지가 없습니다.</p>
           </div>
        )}

        {/* 스크롤 시 한 줄씩 쌓이는 텍스트 */}
        <div className="absolute top-[58%] left-0 w-full flex flex-col items-center justify-start z-10 pointer-events-none px-6 gap-2">
          {scriptPhrases.map((phrase, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: visibleIdx >= idx ? 1 : 0,
                y: visibleIdx >= idx ? 0 : 10
              }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full text-center"
            >
              <Typography 
                className={cn(
                  "font-serif text-[0.85rem] leading-[1.8] text-gray-800 break-keep whitespace-pre-line",
                  idx === 3 ? "mt-4 font-normal" : ""
                )}
              >
                {phrase}
              </Typography>
            </motion.div>
          ))}
        </div>
        
        {/* Scroll Hint */}
        <motion.div 
            style={{ opacity: scrollHintOpacity, willChange: "opacity" }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
            <ScrollIndicator color="#666666" text="Scroll Down" />
        </motion.div>
      </motion.div>

      {/* Exit transition gradient */}
      <motion.div 
        animate={{ opacity: isExiting ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-neutral-100 via-neutral-100/80 to-transparent z-30 pointer-events-none"
      />
    </div>
  );
}
