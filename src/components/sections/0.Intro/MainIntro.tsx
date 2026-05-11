'use client';

import { useRef, useEffect, useState } from 'react';
import { SectionProps } from '@/types/wedding';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
    "신부가 드레스를 고르는 중...",
    "신랑이 정장을 맞추는 중...",
    "웨딩홀에 꽃장식을 하는 중...",
    "신부가 메이크업을 받는 중...",
    "맛있는 식사를 준비하는 중..."
];

export default function MainIntro({ config, isVisible, onEnter, isPreloading, loadingProgress }: SectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (isPreloading) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPreloading]);

  // Canvas Rendering Loop
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      if (video.readyState >= 2) {
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;

        if (vWidth > 0 && vHeight > 0) {
          // 캔버스 내부 해상도를 비디오 원본 크기에 맞춤
          if (canvas.width !== vWidth || canvas.height !== vHeight) {
            canvas.width = vWidth;
            canvas.height = vHeight;
          }
          ctx.drawImage(video, 0, 0, vWidth, vHeight);
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      const playVideo = async () => {
        try {
          if (videoRef.current) {
            await videoRef.current.play();
          }
        } catch (error) {
          console.warn("Video auto-play failed. Retrying on interaction:", error);
          const handleFirstClick = () => {
            videoRef.current?.play().catch(() => {});
            window.removeEventListener('click', handleFirstClick);
            window.removeEventListener('touchstart', handleFirstClick);
          };
          window.addEventListener('click', handleFirstClick);
          window.addEventListener('touchstart', handleFirstClick);
        }
      };

      playVideo();
    }
  }, [isVisible]);

  if (!isVisible) return null;
  
  const { mainImage, introVideo = '/test-resources/intro.mp4' } = config as { mainImage?: string; introVideo?: string; title?: string };

  return (
    <section 
      className="w-full h-[100lvh] flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-white"
      onClick={onEnter}
    >
        <div className="relative w-full h-full">
            {introVideo ? (
                <>
                    <video
                        ref={videoRef}
                        src={introVideo}
                        autoPlay
                        muted
                        playsInline
                        preload="auto"
                        onLoadedData={() => videoRef.current?.play().catch(() => {})}
                        className="opacity-0 absolute pointer-events-none w-0 h-0" // display: none 대신 opacity-0 사용하여 브라우저 최적화 방지
                    />
                    <canvas 
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </>
            ) : mainImage ? (
                <Image
                    src={mainImage}
                    alt="Main Cover"
                    fill
                    className="object-cover"
                    priority
                />
            ) : null}

            {/* Loading Overlay */}
            <AnimatePresence mode="wait">
                {isPreloading && (
                    <motion.div 
                        key="loading"
                        className="absolute bottom-20 left-0 right-0 flex flex-col items-center justify-center z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="w-48 h-[2px] bg-white/30 rounded-full overflow-hidden"
                        >
                            <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${loadingProgress || 0}%` }}
                                transition={{ ease: "easeOut", duration: 0.3 }}
                            />
                        </motion.div>
                        <div className="mt-6 h-8 relative overflow-hidden flex items-center justify-center w-full">
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={messageIndex}
                                    initial={{ y: 15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -15, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="absolute text-[11px] text-white font-medium tracking-[0.1em] whitespace-nowrap px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg"
                                >
                                    {LOADING_MESSAGES[messageIndex]}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </section>
  );
}

