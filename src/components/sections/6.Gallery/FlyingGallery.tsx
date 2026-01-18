'use client';

import { SectionProps } from '@/types/wedding';
import { Typography } from '@/components/ui/Typography';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { motion, useScroll, useTransform, useMotionValueEvent, Variants, MotionValue } from 'framer-motion';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';

// Test gallery images
const GALLERY_IMAGES = Array.from({ length: 20 }, (_, i) => `/test-resources/gallery/${i + 1}.jpg`);

export default function FlyingGallery({ config, isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const containerRef = useRef<HTMLElement>(null);
  const [animationState, setAnimationState] = useState<'hidden' | 'visible' | 'top'>('hidden');
  const [showImages, setShowImages] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  
  const configImages = config?.images as string[] | undefined;
  const images = (configImages && configImages.length > 0) ? configImages : GALLERY_IMAGES;
  const title = (config?.title as string) || '갤러리';

  const { scrollYProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'end start']
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 1. 타이틀 및 컨테이너 고정: 0.35부터
    if (latest > 0.3) {
      setAnimationState('top');
    } else if (latest > 0.15) {
      setAnimationState('visible');
    } else {
      setAnimationState('hidden');
    }

    // 2. 이미지 등장: 0.4부터 (사용자 요청)
    if (latest > 0.4) {
      setShowImages(true);
    } else {
      setShowImages(false);
    }
  });

  // 사진 클릭 핸들러
  const handlePhotoClick = (index: number) => {
    console.log('[FlyingGallery] Photo clicked:', index);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const titleVariants: Variants = {
    hidden: { 
      y: "480px", opacity: 0, scale: 0.8,
      transition: { duration: 1.0, ease: "easeInOut" }
    },
    visible: { 
      y: 0, opacity: 1, scale: 1.2,
      transition: { duration: 1.0, ease: "easeInOut" }
    },
    top: {
      y: "-320px", opacity: 1, scale: 0.8,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  if (!isVisible) return null;

  const isFixed = animationState === 'top';

  return (
    <>
      <section ref={containerRef} className="relative w-full h-full overflow-hidden bg-white">
        <div 
          className="flex flex-col items-center justify-center"
          style={{
            position: isFixed ? 'fixed' : 'absolute',
            top: 0, left: 0, right: 0,
            height: '100dvh',
            zIndex: isFixed ? 50 : 'auto',
            pointerEvents: isFixed ? 'auto' : 'none',
            backgroundColor: 'white',
            // perspective 제거 (가짜 3D 사용)
          }}
        >
          {/* Title */}
          <motion.div 
            initial="hidden"
            animate={animationState}
            variants={titleVariants}
            className="text-center z-20"
          >
            <Typography variant="display">
              {title}
            </Typography>
          </motion.div>

          {/* Flying Photos: 컨테이너가 고정되고(top) + 스크롤이 0.4를 넘었을 때(showImages) 표시 */}
          {animationState === 'top' && showImages && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              // transformStyle 제거
            >
              {images.map((src, idx) => (
                <FlyingPhoto 
                  key={idx}
                  src={src}
                  index={idx}
                  total={images.length}
                  scrollProgress={scrollYProgress}
                  onClick={() => handlePhotoClick(idx)}
                />
              ))}
            </div>
          )}
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

function FlyingPhoto({ 
  src, 
  index, 
  total,
  scrollProgress,
  onClick
}: { 
  src: string; 
  index: number;
  total: number;
  scrollProgress: MotionValue<number>;
  onClick: () => void;
}) {
  // 결정론적 랜덤 함수 (index 기반)
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };

  // 랜덤 X, Y 오프셋 (-50px ~ 50px)
  const offsetX = (seededRandom(index * 2 + 1) - 0.5) * 200;
  const offsetY = (seededRandom(index * 2 + 2) - 0.5) * 200;

  // 각 사진의 초기 z 위치 (가상 좌표계)
  // 간격 요청: 2000 -> 800
  const zSpacing = 800;
  const initialZ = -1000 - (index * zSpacing);
  
  // 스크롤 이동 거리
  const totalTravelDistance = 2000 + (total * zSpacing); 
  
  // 가상의 Z 위치 (실제 translateZ 아님)
  // 속도는 기존 범위로 복원: 0.0 ~ 1.0 -> 0.35 ~ 0.8
  const zPosition = useTransform(
    scrollProgress,
    [0.40, 0.8],
    [initialZ, initialZ + totalTravelDistance]
  );

  // Z 위치를 Scale로 변환 (Pseudo-3D)
  // 멀리(마이너스) 있을수록 작게, 0일 때 1, 가까우면(플러스) 크게
  const scale = useTransform(
    zPosition,
    [-2000, -1000, 0, 500],
    [0.2, 0.5, 1, 1.3] 
  );

  // Opacity 조정
  const opacity = useTransform(
    zPosition,
    [-1500, -500, 200, 600],
    [0, 1, 1, 0]
  );
  
  // 클릭 가능한 유효 범위 (Z=0 전후)
  const pointerEvents = useTransform(
    zPosition,
    (z) => (z > -800 && z < 400 ? "auto" : "none")
  );

  // 안 보일 때는 숨김
  const visibility = useTransform(
    zPosition,
    (z) => (z > -2000 && z < 2000 ? "visible" : "hidden")
  );

  // zIndex: 앞에 있는 사진일수록 높은 z-index
  const baseZIndex = total - index;

  return (
    <motion.div
      className="absolute flex items-center justify-center cursor-pointer"
      style={{
        translateX: offsetX,
        translateY: offsetY,
        scale,        // 3D 거리감 표현용 Scale
        opacity,
        visibility,
        zIndex: baseZIndex,
        pointerEvents, 
        touchAction: 'pan-y'
      }}
      onTap={() => onClick()} // 탭 이벤트는 바깥에서 감지
    >
      {/* 내부 div에 클릭 반응 애니메이션 적용 */}
      <motion.div 
        className="relative w-[280px] h-[380px] rounded-xl overflow-hidden shadow-2xl bg-white"
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Image 
          src={src} 
          alt={`Gallery photo ${index + 1}`}
          fill
          className="object-cover"
          sizes="280px"
          priority={index < 3}
          style={{ pointerEvents: 'none' }}
        />
      </motion.div>
    </motion.div>
  );
}
