'use client';

import { SectionProps } from '@/types/wedding';
import { Typography } from '@/components/ui/Typography';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { motion, useTransform, MotionValue, useScroll, useMotionValue, useMotionValueEvent, animate, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';


const GALLERY_IMAGES = Array.from({ length: 33 }, (_, i) => `/test-resources/gallery2/${i + 1}.webp`);

function DiagonalPhoto({
  src,
  index,
  total,
  globalProgress,
  onClick
}: {
  src: string;
  index: number;
  total: number;
  globalProgress: MotionValue<number>;
  onClick: () => void;
}) {
  const offset = useTransform(globalProgress, (progress) => index - progress);

  const x = useTransform(offset, (v) => v * 60); 
  const y = useTransform(offset, (v) => v * -100);
  const z = useTransform(offset, (v) => v * -250); 

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

  // 렌더링 최적화: 시야에서 완전히 벗어나면 display를 none 처리
  // 페이드인/아웃 구간: -5~-1 (카메라를 지나칠 때 퇴장), 8~12 (멀리서 다가올 때 진입)
  const opacity = useTransform(offset, [-5, -1, 8, 12], [0, 0.9, 0.9, 0]);
  const display = useTransform(offset, (v) => (v > 12 || v < -5) ? "none" : "flex");
  const pointerEvents = useTransform(offset, (v) => (v > -3 && v < 12) ? 'auto' : 'none');

  // [메모리 크래시 핵심 수정] React 상태 대신 직접 DOM src 조작 (Virtualization)
  const imgRef = useRef<HTMLImageElement>(null);

  // 브라우저 렌더링 직후에 한 번 강제로 현재 offset 기준으로 src 설정 (새로고침 시 alt 텍스트 깜빡임 방지)
  useEffect(() => {
    if (imgRef.current) {
      const currentOffset = offset.get();
      if (currentOffset > -7 && currentOffset < 14) {
        imgRef.current.setAttribute('src', src);
      }
    }
  }, [offset, src]);

  useMotionValueEvent(offset, "change", (latest) => {
    if (!imgRef.current) return;
    // 화면에 보이기 직전(14)부터 메모리에 올리고, 벗어나면(-7) 메모리 완전 해제
    const shouldLoad = latest > -7 && latest < 14;
    const currentSrc = imgRef.current.getAttribute('src');
    
    if (shouldLoad && currentSrc !== src) {
      imgRef.current.setAttribute('src', src);
    } else if (!shouldLoad && currentSrc) {
      // src 속성 자체를 제거하여 브라우저의 GPU/RAM에 상주하는 디코딩된 비트맵 메모리 완전 반환
      imgRef.current.removeAttribute('src');
    }
  });

  return (
    <motion.div
      className="absolute top-0 left-[5%] w-[90%] h-full flex items-center justify-center pointer-events-none"
      style={{
        x, y, z, display,
        rotateY: -20,
        zIndex: total - index,
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
            ref={imgRef}
            alt={`Album photo ${index + 1}`}
            // text-transparent를 추가하여 src가 비어있을 때 alt 텍스트가 노출되는 것을 숨김
            className="relative block w-auto h-auto max-w-[75vw] max-h-[75vw] sm:max-w-[300px] sm:max-h-[300px] text-transparent"
            loading="eager"
            decoding="async"
            // 초기 로딩 시 상위 14개 이미지만 즉시 src 부여 (Virtualization 유지하면서 깜빡임 제거)
            src={index < 14 ? src : undefined}
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
  const title = (config?.title as string) || '갤러리';

  // 1. 완벽한 Sticky 구간에서만 스크롤이 사진 인덱스에 매핑됨
  const rawScrollOffset = useTransform(stickyProgress, [0, 1], [0, images.length - 0.5]);
  // useSpring으로 스크롤 입력을 부드럽게 보간 (끊김 제거)
  const globalProgress = useSpring(rawScrollOffset, { stiffness: 300, damping: 30, mass: 0.5 });

  const [showTitle, setShowTitle] = useState(false);

  // 화면 진입 시 타이틀 등장 트랜지션 (inViewProgress 기준)
  useMotionValueEvent(inViewProgress, "change", (latest) => {
    if (latest > 0.5) {
      setShowTitle(true);
    } else {
      setShowTitle(false);
    }
  });

  // 브라우저 백그라운드에서 모든 사진을 미리 다운로드(캐싱) 및 디코딩하는 프리로드 로직
  useEffect(() => {
    if (!isVisible || typeof window === 'undefined') return;

    // 1. 중복 방지: config에 이미지가 명시되어 있다면 SectionRegistry에서 이미 프리로딩을 수행함
    const hasConfigImages = config?.images && (config.images as string[]).length > 0;
    if (hasConfigImages) return;

    const preloadAllImages = async () => {
      // 2. 순차적 로딩 및 디코딩: 네트워크 대역폭을 독점하지 않으면서 메모리에 미리 올림
      for (const src of images) {
        try {
          const img = new window.Image();
          img.src = src;
          // 브라우저가 지원한다면 decode()를 호출하여 GPU 메모리에 미리 로드
          if ('decode' in img) {
            await img.decode().catch(() => {}); 
          }
        } catch (e) {
          console.warn(`Failed to preload gallery image: ${src}`, e);
        }
      }
    };

    // 3. 브라우저 유휴 시간에 실행하여 초기 렌더링 성능에 영향 주지 않음
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => preloadAllImages());
    } else {
      setTimeout(preloadAllImages, 1500);
    }
  }, [images, isVisible, config?.images]);

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
            <Typography className="font-gowun text-[1.6rem] tracking-[0.15em] text-black/80 font-medium py-0 px-0 border-none">
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
