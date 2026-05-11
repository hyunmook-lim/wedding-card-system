'use client';

import { useRef, useEffect, useState } from 'react';
import { SectionProps } from '@/types/wedding';
import { cn } from '@/lib/utils';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, animate } from 'framer-motion';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { usePreloadedVideo, useIntroFaded } from '@/lib/preloaded-media-context';

export default function VideoGreeting2({ config, isVisible }: SectionProps) {
  const { src: videoSrc = '/test-resources/video.mp4' } = config as { src?: string };

  const preloadedVideo = usePreloadedVideo(videoSrc);
  const introFadedOut = useIntroFaded();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);

  const [hasEnded, setHasEnded] = useState(false);
  const scrollRef = useStickyScrollRef();

  const { scrollYProgress } = useScroll({
    target: scrollRef as React.RefObject<HTMLElement> | undefined,
    offset: ['start start', 'end start'],
  });

  const endProgress = useMotionValue(0);

  const videoOpacity = useTransform(
    [scrollYProgress, endProgress],
    ([s, e]: number[]) => Math.max(0.10, 1 - Math.max((s as number) / 0.3, e as number))
  );
  const videoBlur = useTransform(
    [scrollYProgress, endProgress],
    ([s, e]: number[]) => `blur(${Math.min(Math.max((s as number) / 0.3, e as number) * 20, 20)}px)`
  );
  const hintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;

        if (vWidth > 0 && vHeight > 0) {
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
  }, [preloadedVideo]);

  // ── Effect A: 프리로드 객체를 DOM에 마운트 + ended 핸들러 등록 ──────────
  useEffect(() => {
    const container = videoContainerRef.current;
    const video = preloadedVideo;
    if (!container || !video) return;

    videoRef.current = video;
    container.appendChild(video);

    const handleEnded = () => {
      setHasEnded(true);
      animate(endProgress, 1, { duration: 1.0, ease: 'easeInOut' });
    };
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.pause();
      if (container.contains(video)) container.removeChild(video);
      videoRef.current = null;
    };
  }, [preloadedVideo, endProgress]);

  // ── Effect B: fallback <video> 태그 설정 (프리로드 없을 때) ────────────
  useEffect(() => {
    if (preloadedVideo) return; 
    const video = fallbackVideoRef.current;
    if (!video) return;

    videoRef.current = video;

    const handleEnded = () => {
      setHasEnded(true);
      animate(endProgress, 1, { duration: 1.0, ease: 'easeInOut' });
    };
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [preloadedVideo, endProgress]);

  // ── Effect C: MainIntro가 완전히 사라진 후 재생 ────────────────────────
  useEffect(() => {
    if (!introFadedOut) return;
    const video = videoRef.current;
    if (!video) return;
    video.play().catch((err) => console.warn('VideoGreeting2 play error:', err));
  }, [introFadedOut]);

  if (!isVisible) return null;

  return (
    <div className={cn('relative w-full h-[100lvh] bg-transparent overflow-hidden')}>
      <motion.div
        className="absolute inset-0 w-full h-full bg-white"
        style={{ opacity: videoOpacity, filter: videoBlur, willChange: 'opacity, filter' }}
      >
        {/* Canvas for rendering */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 프리로드 객체 삽입 컨테이너 (숨김 상태이나 활성 상태 유지) */}
        <div ref={videoContainerRef} className="opacity-0 absolute pointer-events-none w-0 h-0 overflow-hidden" />

        {/* fallback: 프리로드 객체가 없을 때 (숨김 상태) */}
        {!preloadedVideo && (
          <video
            ref={fallbackVideoRef}
            src={videoSrc}
            muted
            playsInline
            preload="auto"
            className="opacity-0 absolute pointer-events-none w-0 h-0"
          />
        )}
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
            >
              <ScrollIndicator color="#333333" text="Scroll Down" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

