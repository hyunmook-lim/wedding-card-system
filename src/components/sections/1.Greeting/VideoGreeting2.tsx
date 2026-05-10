'use client';

import { useRef, useEffect, useState } from 'react';
import { SectionProps } from '@/types/wedding';
import { cn } from '@/lib/utils';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, animate } from 'framer-motion';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { usePreloadedVideo } from '@/lib/preloaded-media-context';

export default function VideoGreeting2({ config, isVisible }: SectionProps) {
  const { src: videoSrc = '/test-resources/video.mp4' } = config as { src?: string };

  // Context에서 프리로드된 HTMLVideoElement 객체를 가져옴
  const preloadedVideo = usePreloadedVideo(videoSrc);

  // 프리로드 객체가 없을 때 fallback으로 사용하는 <video> 태그 ref
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  // 실제로 제어에 사용하는 ref (preloaded or fallback)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // 프리로드된 video 엘리먼트를 삽입할 컨테이너
  const videoContainerRef = useRef<HTMLDivElement>(null);

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

  // ── 케이스 A: 프리로드된 video 객체가 있을 때 ──────────────────────────
  // 직접 DOM에 appendChild → 버퍼가 그대로 유지되어 즉시 재생 가능
  useEffect(() => {
    const container = videoContainerRef.current;
    const video = preloadedVideo;
    if (!container || !video) return;

    // videoRef를 프리로드 객체로 연결
    videoRef.current = video;
    container.appendChild(video);

    // ended 이벤트 핸들러
    const handleEnded = () => {
      setHasEnded(true);
      animate(endProgress, 1, { duration: 1.0, ease: 'easeInOut' });
    };
    video.addEventListener('ended', handleEnded);

    // 버퍼가 이미 채워져 있으므로 딜레이 없이 즉시 재생
    video.play().catch((err) => console.warn('VideoGreeting2 preloaded play error:', err));

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.pause();
      if (container.contains(video)) container.removeChild(video);
      videoRef.current = null;
    };
  }, [preloadedVideo, endProgress]);

  // ── 케이스 B: 프리로드 없을 때 fallback <video> 태그로 재생 ─────────────
  useEffect(() => {
    if (preloadedVideo) return; // 케이스 A가 처리
    const video = fallbackVideoRef.current;
    if (!video) return;

    videoRef.current = video;

    const handleEnded = () => {
      setHasEnded(true);
      animate(endProgress, 1, { duration: 1.0, ease: 'easeInOut' });
    };
    video.addEventListener('ended', handleEnded);

    // fallback은 네트워크 요청이 필요하므로 약간의 여유 딜레이
    const timer = setTimeout(() => {
      video.play().catch((err) => console.warn('VideoGreeting2 fallback play error:', err));
    }, 300);

    return () => {
      video.removeEventListener('ended', handleEnded);
      clearTimeout(timer);
    };
  }, [preloadedVideo, endProgress]);

  if (!isVisible) return null;

  return (
    <div className={cn('relative w-full h-[100lvh] bg-transparent overflow-hidden')}>
      <motion.div
        className="absolute inset-0 w-full h-full bg-white"
        style={{ opacity: videoOpacity, filter: videoBlur, willChange: 'opacity, filter' }}
      >
        {/* 프리로드 객체 삽입 컨테이너 */}
        <div ref={videoContainerRef} className="absolute inset-0 w-full h-full" />

        {/* 프리로드 객체가 없을 때 fallback <video> 태그 */}
        {!preloadedVideo && (
          <video
            ref={fallbackVideoRef}
            src={videoSrc}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
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
