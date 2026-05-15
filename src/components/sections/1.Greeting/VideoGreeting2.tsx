'use client';

import { useRef, useEffect, useState } from 'react';
import { SectionProps } from '@/types/wedding';
import { cn } from '@/lib/utils';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, animate, useMotionValueEvent } from 'framer-motion';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { useIntroFaded } from '@/lib/preloaded-media-context';

const TOTAL_FRAMES = 74;
const FRAME_RATE = 25; // 약 3초 분량 (73프레임 / 25fps)
const FRAME_PATH = '/test-resources/video';

export default function VideoGreeting2({ isVisible }: SectionProps) {
  const introFadedOut = useIntroFaded();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const [hasEnded, setHasEnded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const scrollRef = useStickyScrollRef();
  const { scrollYProgress } = useScroll({
    target: scrollRef as React.RefObject<HTMLElement> | undefined,
    offset: ['start start', 'end start'],
  });

  const endProgress = useMotionValue(0);

  const videoOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  
  const videoBlur = useTransform(scrollYProgress, [0, 0.3], ["blur(0px)", "blur(20px)"]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const [resetKey, setResetKey] = useState(0);
  
  // 스크롤이 맨 위로 돌아오면 영상 상태 초기화 및 재재생 준비
  useMotionValueEvent(scrollYProgress, "change", (latest: number) => {
    if (latest === 0 && hasEnded) {
      setHasEnded(false);
      endProgress.set(0);
      setResetKey(prev => prev + 1);
    }
  });

  useEffect(() => {
    let loadedCount = 0;
    const handleLoad = () => {
      loadedCount++;
      if (loadedCount === TOTAL_FRAMES) {
        setIsLoaded(true);
      }
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new window.Image();
      const frameNum = String(i).padStart(4, '0');
      img.onload = handleLoad;
      img.onerror = handleLoad;
      img.src = `${FRAME_PATH}/frame_${frameNum}.webp`;
      framesRef.current[i] = img;
    }
  }, []);

  // 1.5 첫 프레임 미리 그리기 (Poster 역할)
  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const drawFirst = () => {
      // 로딩이 완료되고 인트로가 끝나서 재생 루프가 시작될 상황이면 중단
      if (isLoaded && introFadedOut) return;

      const firstImg = framesRef.current[1];
      if (firstImg && firstImg.complete) {
        if (canvas.width !== firstImg.naturalWidth || canvas.height !== firstImg.naturalHeight) {
          canvas.width = firstImg.naturalWidth;
          canvas.height = firstImg.naturalHeight;
        }
        ctx.drawImage(firstImg, 0, 0);
      }
    };

    const timer = setInterval(drawFirst, 100);
    return () => clearInterval(timer);
  }, [isVisible, isLoaded, introFadedOut]);

  // 2. 캔버스 렌더링 루프 (Image Sequence)
  useEffect(() => {
    if (!introFadedOut || !isLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let startTime: number | null = null;

    const render = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      
      // 현재 프레임 계산
      const frameIndex = Math.min(
        Math.floor((elapsed / 1000) * FRAME_RATE) + 1, 
        TOTAL_FRAMES
      );
      
      const img = framesRef.current[frameIndex];
      if (img && img.complete) {
        // 캔버스 크기 조정 (첫 프레임 기준)
        if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        ctx.drawImage(img, 0, 0);
      }

      if (frameIndex < TOTAL_FRAMES) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        // 재생 완료
        setHasEnded(true);
        animate(endProgress, 1, { duration: 1.0, ease: 'easeInOut' });
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [introFadedOut, isLoaded, endProgress, resetKey]);

  if (!isVisible) return null;

  return (
    <div className={cn('relative w-full h-[100lvh] bg-transparent overflow-hidden')}>
      <motion.div
        className="absolute inset-0 w-full h-full bg-white"
        style={{ opacity: videoOpacity, filter: videoBlur, willChange: 'opacity, filter' }}
      >
        {/* Canvas for rendering Image Sequence */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </motion.div>

      {/* Scroll Hint */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        style={{ opacity: hintOpacity, willChange: 'opacity' }}
      >
        <AnimatePresence>
          {hasEnded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="scale-[1.2]"
            >
              <ScrollIndicator color="#333333" text="스크롤을 내려주세요" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}


