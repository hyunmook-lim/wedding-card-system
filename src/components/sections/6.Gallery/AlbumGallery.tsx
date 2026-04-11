'use client';

import { SectionProps } from '@/types/wedding';
import { Typography } from '@/components/ui/Typography';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { motion, useTransform, MotionValue, useScroll, useMotionValue, useMotionValueEvent, animate, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';


const GALLERY_IMAGES = Array.from({ length: 20 }, (_, i) => `/test-resources/gallery/${i + 1}.jpg`);

function DiagonalPhoto({
  src,
  index,
  total,
  globalProgress,
  inViewProgress,
  onClick
}: {
  src: string;
  index: number;
  total: number;
  globalProgress: MotionValue<number>;
  inViewProgress: MotionValue<number>;
  onClick: () => void;
}) {
  const offset = useTransform(globalProgress, (progress) => index - progress);

  const x = useTransform(offset, (v) => v * 40); 
  const y = useTransform(offset, (v) => v * -60);
  const z = useTransform(offset, (v) => v * -180); 

  // 가운데 지정석 도달 시 팝업 — useRef + imperative animate로 리렌더 제로
  const isActiveRef = useRef(false);
  const popY = useMotionValue(0);
  const popScale = useMotionValue(1);
  useMotionValueEvent(offset, "change", (latest) => {
    const active = Math.abs(latest) <= 0.45;
    if (isActiveRef.current !== active) {
      isActiveRef.current = active;
      animate(popY, active ? -120 : 0, { duration: 0.25, ease: "easeOut" });
      animate(popScale, active ? 1.05 : 1, { duration: 0.25, ease: "easeOut" });
    }
  });

  // 등장 시 페이드인
  const entranceOpacity = useTransform(inViewProgress, [0.95, 1.0], [0, 0.9]);
  // 지나간 사진이 서서히 페이드아웃 (offset -1 ~ -4 구간에서 점진적으로 사라짐)
  const exitOpacity = useTransform(offset, [-5, -1, 40], [0, 0.9, 0.9]);
  // 두 값 중 작은 쪽 적용
  const opacity = useTransform([entranceOpacity, exitOpacity], ([a, b]: number[]) => Math.min(a, b));

  // 페이드아웃 완료 후 DOM에서 제거 (-5 이하이면 이미 opacity 0)
  const display = useTransform(offset, (v) => (v > 40 || v < -5) ? "none" : "flex");
  const pointerEvents = useTransform(offset, (v) => (v > -3 && v < 40) ? 'auto' : 'none');

  return (
    <motion.div
      className="absolute top-0 left-[5%] w-[90%] h-full flex items-center justify-center pointer-events-none"
      style={{
        x, y, z, display,
        rotateY: -20,
        zIndex: total - index,
        willChange: 'transform',
        transformStyle: 'preserve-3d'
      }}
    >
      <motion.div 
        className="relative cursor-pointer"
        style={{ pointerEvents, y: popY, scale: popScale }}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div 
          className="relative overflow-hidden"
          style={{ 
            opacity,
            boxShadow: '0 15px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            borderRight: '2px solid rgba(255,255,255,0.08)',
          }}
        >
          <motion.img 
            src={src} 
            alt={`Album photo ${index + 1}`}
            className="relative block w-auto h-auto max-w-[75vw] max-h-[75vw] sm:max-w-[300px] sm:max-h-[300px]"
            loading="lazy"
            decoding="async"
          />

          {/* 상단 테두리 — 왼쪽 대각선 컷 (투명→불투명 그라데이션) */}
          <div 
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{
              height: '2px',
              background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.08) 15%, rgba(255,255,255,0.08) 100%)',
            }}
          />

          {/* 유리 반사 오버레이 */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 30%, transparent 50%, rgba(255,255,255,0.1) 100%)',
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function AlbumGallery({ config, isVisible }: SectionProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const scrollRef = useStickyScrollRef();
  
  // 1. 컨테이너가 화면 하단에 등장해서 상단에 닿을 때까지의 경로 (0 to 1) 
  const { scrollYProgress: inViewProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'start start']
  });

  // 2. 상단에 정확히 고정(Sticky)된 시점부터 스크롤이 끝날 때까지 (0 to 1)
  const { scrollYProgress: stickyProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start start', 'end end']
  });

  const configImages = config?.images as string[] | undefined;
  const images = (configImages && configImages.length > 0) ? configImages : GALLERY_IMAGES;
  const title = (config?.title as string) || 'Album Gallery';

  // 1. 완벽한 Sticky 구간에서만 스크롤이 사진 인덱스에 매핑됨
  const rawScrollOffset = useTransform(stickyProgress, [0, 1], [0, images.length - 0.5]);
  // useSpring으로 스크롤 입력을 부드럽게 보간 (끊김 제거)
  const scrollOffset = useSpring(rawScrollOffset, { stiffness: 300, damping: 30, mass: 0.5 });
  
  // 2. 시간 기반 등장 오프셋 (맨 뒤 -20 궤도선상에서 대기)
  const entranceOffset = useMotionValue(-20);
  
  // 두 값을 합쳐 최종 진행률 산출
  const globalProgress = useTransform([scrollOffset, entranceOffset], ([s, e]: number[]) => s + e);

  const hasEnteredRef = useRef(false);

  // 컨테이너가 완벽히 상단에 고정된 시점(stickyProgress > 0)에 촤라락 모션 격발!
  useMotionValueEvent(stickyProgress, "change", (latest) => {
    if (latest > 0.001 && !hasEnteredRef.current) {
      hasEnteredRef.current = true;
      animate(entranceOffset, 0, { type: "spring", stiffness: 150, damping: 25, mass: 0.8 });
    } 
  });

  // 컨테이너가 다시 화면 아래로 내려갈 때 초기화
  useMotionValueEvent(inViewProgress, "change", (latest) => {
    if (latest < 0.5 && hasEnteredRef.current) {
      hasEnteredRef.current = false;
      entranceOffset.set(-20);
    }
  });

  const [showTitle, setShowTitle] = useState(false);

  // 화면 진입 시 타이틀 등장 트랜지션 (inViewProgress 기준)
  useMotionValueEvent(inViewProgress, "change", (latest) => {
    if (latest > 0.5) {
      setShowTitle(true);
    } else {
      setShowTitle(false);
    }
  });

  // 브라우저 백그라운드에서 모든 사진을 미리 다운로드(캐싱)하는 프리로드 로직
  useEffect(() => {
    if (!isVisible || typeof window === 'undefined') return;

    const preloadAllImages = () => {
      images.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    };

    // 웹 페이지 접속 시 스크롤에 버벅임이 없도록 브라우저 여유 시간에 20장 전부 다운로드
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadAllImages);
    } else {
      setTimeout(preloadAllImages, 1000);
    }
  }, [images, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <section className="relative w-full h-[100dvh]">
        {/* 1. 타이틀 영역: 독립적으로 최상단에 배치하여 중앙 정렬 간섭 방지 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ 
            opacity: showTitle ? 1 : 0, 
            y: showTitle ? 0 : 50 
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ 
            scale: 0.55, 
            transformOrigin: "top center",
            willChange: "transform, opacity"
          }}
          className="absolute top-16 inset-x-0 flex flex-col items-center z-30 pointer-events-none"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center space-x-3 mb-4 opacity-30">
              <div className="w-8 h-[0.5px] bg-black" />
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-black/80">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <div className="w-8 h-[0.5px] bg-black" />
            </div>
            <Typography className="font-serif text-[1.6rem] tracking-[0.15em] text-black/80 font-medium py-0 px-0 border-none">
              {title}
            </Typography>
            <Typography className="text-[0.6rem] tracking-[0.4em] text-black/40 mt-3 font-light uppercase opacity-80">
              Our Memories
            </Typography>
          </div>
        </motion.div>

        <div className="absolute top-0 left-0 w-full h-[100dvh] flex flex-col items-center justify-center bg-transparent overflow-hidden perspective-[1000px]">
          {/* 2. 3D Diagonal Gallery Layer: 부모는 정적 컨테이너로 두고 개별 사진들이 날아오는 효과로 대체 */}
          <div 
            className="absolute inset-0 z-10 flex flex-col justify-center pt-24 pb-8"
          >
            <div className="relative w-full h-[65vh] max-h-[500px]">
              {/* Visual 3D Layer */}
              <div className="absolute inset-0 z-0 pointer-events-none" style={{ perspective: "1200px" }}>
                {images.map((src, idx) => (
                  <DiagonalPhoto 
                    key={idx} 
                    src={src} 
                    index={idx} 
                    total={images.length} 
                    globalProgress={globalProgress}
                    inViewProgress={inViewProgress}
                    onClick={() => {
                       setViewerIndex(idx);
                       setViewerOpen(true);
                    }}
                  />
                ))}
              </div>

              {/* Navigation Hint */}
              <div 
                className="absolute -bottom-2 left-0 w-full text-center pointer-events-none z-30"
              >
                <Typography className="text-[0.65rem] text-black/40 font-medium tracking-widest uppercase px-4 py-1.5 rounded-full inline-block">
                  스크롤하여 계속 감상하기
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Viewer Modal */}
      <ImageViewer
        images={images}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}
