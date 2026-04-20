'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { SectionProps } from '@/types/wedding';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/Typography';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import Image from 'next/image';

export default function VideoGreeting({ config, isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Extract config
  const images = useMemo(() => (config.images as string[]) || [], [config.images]);
  
  // Height multiplier for scroll distance

  const { scrollYProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start start', 'end end'],
  });

  // Exit phase: When the sticky container scrolls out of view (after 'end end')
  const { scrollYProgress: scrollYExit } = useScroll({
    target: scrollRef || undefined,
    offset: ['end end', 'end start'],
  });

  const scriptPhrases = [
    "어느 한 단어로 정의하기엔\n너무 예쁘고",
    "세상에 존재하지 않는 단어일지 모를\n귀한 감정들에",
    "차마 이름을 붙이지 못하고",
    "8년의 시간을 흘려보내게 해준",
    "소중한 사람을 만나 결혼합니다."
  ];

  // Map each phrase to a scroll range
  const p1Opacity = useTransform(scrollYProgress, [0.05, 0.1, 0.2, 0.25], [0, 1, 1, 0]);
  const p1Y = useTransform(scrollYProgress, [0.05, 0.1, 0.2, 0.25], [20, 0, 0, -20]);
  
  const p2Opacity = useTransform(scrollYProgress, [0.25, 0.3, 0.4, 0.45], [0, 1, 1, 0]);
  const p2Y = useTransform(scrollYProgress, [0.25, 0.3, 0.4, 0.45], [20, 0, 0, -20]);

  const p3Opacity = useTransform(scrollYProgress, [0.45, 0.5, 0.6, 0.65], [0, 1, 1, 0]);
  const p3Y = useTransform(scrollYProgress, [0.45, 0.5, 0.6, 0.65], [20, 0, 0, -20]);

  const p4Opacity = useTransform(scrollYProgress, [0.65, 0.7, 0.8, 0.85], [0, 1, 1, 0]);
  const p4Y = useTransform(scrollYProgress, [0.65, 0.7, 0.8, 0.85], [20, 0, 0, -20]);

  const p5Opacity = useTransform(scrollYProgress, [0.85, 0.9, 0.98, 1.0], [0, 1, 1, 1]);
  const p5Y = useTransform(scrollYProgress, [0.85, 0.9, 0.98, 1.0], [20, 0, 0, 0]);

  const opacities = [p1Opacity, p2Opacity, p3Opacity, p4Opacity, p5Opacity];
  const ys = [p1Y, p2Y, p3Y, p4Y, p5Y];

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Effects trigger only during the exit phase
  const containerOpacity = useTransform(scrollYExit, [0, 1], [1, 0]);
  const containerBlur = useTransform(scrollYExit, [0, 1], ["blur(0px)", "blur(10px)"]);

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

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadedImages.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (index: number) => {
      const img = loadedImages[index];
      if (!img) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      if (canvasWidth === 0 || canvasHeight === 0) return;

      // Use object-fit: contain logic to ensure the whole image is visible
      const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
      
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;
      
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Initial render attempt
    render(0);

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // Play video across the full sticky duration (0 -> 1)
      const playbackProgress = latest;
      
      const index = Math.min(
        Math.floor(playbackProgress * (loadedImages.length - 1)),
        loadedImages.length - 1
      );
      requestAnimationFrame(() => render(index));
    });

    return () => unsubscribe();
  }, [loadedImages, scrollYProgress]);

  // 스크롤 시작 감지
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest > 0.01 && !hasScrolled) {
        setHasScrolled(true);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, hasScrolled]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.current.height = window.innerHeight * window.devicePixelRatio;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
    }, []);

  if (!isVisible) return null;

  return (
    <div ref={containerRef} className={cn("relative w-full h-full")}>
      <motion.div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden bg-black"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none pb-20">
          {scriptPhrases.map((phrase, idx) => (
            <motion.div 
              key={idx}
              style={{ 
                opacity: opacities[idx], 
                y: ys[idx],
                willChange: "opacity, transform" 
              }}
              className="absolute text-center text-white px-8 w-full max-w-[400px]"
            >
              <Typography 
                className="font-serif text-[1.1rem] leading-relaxed tracking-[0.05em] text-white/90 break-keep drop-shadow-md whitespace-pre-line"
              >
                {phrase}
              </Typography>
            </motion.div>
          ))}
        </div>
        
        {/* Scroll Hint */}
        <motion.div 
            style={{ opacity: scrollHintOpacity, willChange: "opacity" }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 font-serif text-[1rem] font-medium italic tracking-[0.2em] uppercase animate-bounce"
        >
            Scroll Down
        </motion.div>
      </motion.div>
    </div>
  );
}
