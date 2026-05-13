'use client';

import { useRef, useEffect, useState } from 'react';
import { SectionProps } from '@/types/wedding';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@/components/ui/Loader';

const TOTAL_FRAMES = 45;
const FRAME_RATE = 20; // 45프레임 -> 약 2.2초
const FRAME_PATH = '/test-resources/intro';

export default function MainIntro({ isVisible, onEnter, isPreloading }: SectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const [isIntroLoaded, setIsIntroLoaded] = useState(false);
  const [isFirstFrameRendered, setIsFirstFrameRendered] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    
    // 첫 번째 프레임 우선 로드 및 즉시 렌더링 시도
    const firstImg = new window.Image();
    firstImg.onload = () => {
      loadedCount++;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          canvas.width = firstImg.naturalWidth;
          canvas.height = firstImg.naturalHeight;
          ctx.drawImage(firstImg, 0, 0);
          setIsFirstFrameRendered(true); // 첫 프레임 렌더링 완료 알림
        }
      }
    };
    firstImg.src = `${FRAME_PATH}/frame_0001.jpg`;
    framesRef.current[1] = firstImg;

    const handleLoad = () => {
      loadedCount++;
      if (loadedCount === TOTAL_FRAMES) {
        setIsIntroLoaded(true);
      }
    };

    // 2번부터 나머지 프레임 로드
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      const img = new window.Image();
      const frameNum = String(i).padStart(4, '0');
      img.onload = handleLoad;
      img.onerror = handleLoad;
      img.src = `${FRAME_PATH}/frame_${frameNum}.jpg`;
      framesRef.current[i] = img;
    }
  }, []);

  // 3. 첫 프레임 미리 그리기 (Poster 역할)
  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const drawFirst = () => {
      // 애니메이션이 이미 시작되었거나 로딩이 완료되어 루프가 돌 예정이면 중단
      if (isIntroLoaded) return;
      
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
  }, [isVisible, isIntroLoaded]);

  // 4. 캔버스 렌더링 루프 (Image Sequence)
  useEffect(() => {
    if (!isVisible || !isIntroLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let startTime: number | null = null;

    const render = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      
      const frameIndex = Math.min(
        Math.floor((elapsed / 1000) * FRAME_RATE) + 1, 
        TOTAL_FRAMES
      );
      
      const img = framesRef.current[frameIndex];
      if (img && img.complete) {
        if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        ctx.drawImage(img, 0, 0);
      }

      if (frameIndex < TOTAL_FRAMES) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        // 마지막 프레임에서 정지
        cancelAnimationFrame(animationFrameId);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, isIntroLoaded]);

  if (!isVisible) return null;
  
  return (
    <section 
      className="w-full h-[100lvh] flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-white"
      onClick={onEnter}
    >
        <div className="relative w-full h-full">
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Loading Overlay */}
            <AnimatePresence>
                {isPreloading && isFirstFrameRendered && (
                    <motion.div 
                        key="loading"
                        className="absolute bottom-24 left-0 right-0 flex flex-col items-center justify-center z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Loader />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </section>
  );
}

