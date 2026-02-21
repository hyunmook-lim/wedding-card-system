'use client';

import { SectionProps } from '@/types/wedding';
import { Typography } from '@/components/ui/Typography';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { motion, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTitleAnimation } from '@/hooks/useTitleAnimation';

// Test gallery images
const GALLERY_IMAGES = Array.from({ length: 20 }, (_, i) => `/test-resources/gallery/${i + 1}.jpg`);

export default function FlyingGallery({ config, isVisible }: SectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [showImages, setShowImages] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  
  const configImages = config?.images as string[] | undefined;
  const images = (configImages && configImages.length > 0) ? configImages : GALLERY_IMAGES;
  const title = (config?.title as string) || '갤러리';

  const { animationState, titleVariants, scrollYProgress } = useTitleAnimation({
    variants: {
      top: { y: '-360px', opacity: 1, scale: 0.25 }
    }
  });

  // 이미지 등장 상태 (0.45 이상)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setShowImages(latest > 0.45);
  });

  // 사진 클릭 핸들러
  const handlePhotoClick = (index: number) => {
    console.log('[FlyingGallery] Photo clicked:', index);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  if (!isVisible) return null;

  const isFixed = animationState === 'top';

  return (
    <>
      <section ref={containerRef} className="relative w-full h-full overflow-hidden bg-transparent">
        <div 
          className="flex flex-col items-center justify-center"
          style={{
            position: isFixed ? 'fixed' : 'absolute',
            top: 0, left: 0, right: 0,
            height: '100dvh',
            zIndex: isFixed ? 50 : 'auto',
            pointerEvents: isFixed ? 'auto' : 'none',
            backgroundColor: '#fffdf7',
            // perspective 제거 (가짜 3D 사용)
          }}
        >
          {/* Title */}
          <motion.div 
            initial="hidden"
            animate={animationState}
            variants={titleVariants}
            className="text-center z-20"
            style={{ willChange: "transform, opacity" }}
          >
            <Typography variant="display">
              {title}
            </Typography>
          </motion.div>

          {/* Flying Photos: 컨테이너가 고정되고(top) + 스크롤이 0.45를 넘었을 때(showImages) 표시 */}
          {animationState === 'top' && showImages && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
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
              
              {/* Thank You Message - flies in at the end */}
              <ThankYouMessage scrollProgress={scrollYProgress} />
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
  // 간격 늘림: 800 -> 1200
  const zSpacing = 1200;
  const initialZ = -1000 - (index * zSpacing);
  
  // 스크롤 이동 거리
  const totalTravelDistance = 2000 + (total * zSpacing); 
  
  // 가상의 Z 위치 (실제 translateZ 아님)
  // 스크롤 범위: 0.45 ~ 0.9
  const zPosition = useTransform(
    scrollProgress,
    [0.45, 0.8],
    [initialZ, initialZ + totalTravelDistance]
  );

  // Z 위치를 Scale로 변환 (Pseudo-3D)
  // 멀리(마이너스) 있을수록 작게, 0일 때 1, 가까우면(플러스) 크게
  const scale = useTransform(
    zPosition,
    [-2000, -1000, 0, 500],
    [0.2, 0.5, 1, 1.3] 
  );

  // Opacity 조정 - 더 넓은 범위로 오래 보이도록
  const opacity = useTransform(
    zPosition,
    [-1800, -800, 400, 800],
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
        touchAction: 'pan-y',
        willChange: 'transform, opacity'
      }}
      onTap={() => onClick()} // 탭 이벤트는 바깥에서 감지
    >
      {/* 내부 div에 클릭 반응 애니메이션 적용 */}
      <motion.div 
        className="relative w-[280px] h-[380px] rounded-xl overflow-hidden shadow-2xl bg-[#fffdf7]"
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        style={{ willChange: "transform" }}
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

// Thank You Message Component
function ThankYouMessage({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  // 0.78에서 시작해서 0.8에 도착, 이후 유지
  const zPosition = useTransform(
    scrollProgress,
    [0.78, 0.80],
    [-500, 0]
  );

  const scale = useTransform(
    zPosition,
    [-500, 0],
    [0.5, 1]
  );

  const opacity = useTransform(
    zPosition,
    [-500, -200],
    [0, 1]
  );

  return (
    <motion.div
      className="absolute flex items-center justify-center z-50"
      style={{
        scale,
        opacity,
        willChange: "transform, opacity"
      }}
    >
      <p className="text-2xl font-['GowunDodum'] text-[rgb(255,182,193)] whitespace-nowrap">
        감사합니다
      </p>
    </motion.div>
  );
}
