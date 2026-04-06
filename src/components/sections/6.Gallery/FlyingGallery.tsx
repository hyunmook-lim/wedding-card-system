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
      top: { y: '-340px', opacity: 1, scale: 0.55 }
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
          {/* Title Layer */}
          <motion.div 
            initial="hidden"
            animate={animationState}
            variants={titleVariants}
            className="absolute z-20 text-center w-full px-4"
            style={{ willChange: "transform, opacity" }}
          >
             <div className="flex flex-col items-center justify-center">
               <div className="flex items-center space-x-3 mb-4 opacity-30">
                 <div className="w-8 h-[0.5px] bg-black" />
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-black/80">
                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                 </svg>
                 <div className="w-8 h-[0.5px] bg-black" />
               </div>
               
               <Typography 
                 className="font-serif text-[1.6rem] tracking-[0.15em] text-black/80 font-medium py-0 px-0 border-none"
               >
                 {title}
               </Typography>
               
               <Typography 
                 className="text-[0.6rem] tracking-[0.4em] text-black/40 mt-3 font-light uppercase opacity-80"
               >
                 Our Moments
               </Typography>
             </div>
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

  // Z 위치를 Scale로 변환 (Pseudo-3D) - 부드럽게 커지며 사라지도록 조정
  const scale = useTransform(
    zPosition,
    [-2000, -1000, 0, 400, 800],
    [0.15, 0.5, 1, 1.2, 2.0] 
  );

  // Opacity 조정
  const opacity = useTransform(
    zPosition,
    [-1800, -800, 400, 800],
    [0, 1, 1, 0]
  );
  


  // 시네마틱 렌즈 효과 (Cinematic Blow-out) - 지나갈 때 빛이 번지며 밝아지는 몽환적인 효과
  const filter = useTransform(
    zPosition,
    [-2000, -1500, 0, 400, 800],
    [
      "blur(5px) brightness(0.9) contrast(0.9)", 
      "blur(0px) brightness(1) contrast(1)", 
      "blur(0px) brightness(1) contrast(1)", 
      "blur(2px) brightness(1.05) contrast(1.05)", 
      "blur(10px) brightness(1.2) contrast(1.1)"
    ]
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
        x: offsetX,
        y: offsetY,
        scale,        // 3D 거리감 표현용 Scale
        filter,
        opacity,
        visibility,
        zIndex: baseZIndex,
        pointerEvents, 
        touchAction: 'pan-y',
        willChange: 'transform, opacity, filter'
      }}
      onTap={() => onClick()} // 탭 이벤트는 바깥에서 감지
    >
      {/* 둥둥 떠다니는 플로팅 애니메이션 래퍼 */}
      <motion.div
        animate={{ y: [-15 - (index % 5), 15 + (index % 3)] }}
        transition={{
          duration: 3 + (index % 4) * 0.5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay: (index % 5) * 0.3
        }}
        style={{ willChange: "transform" }}
      >
        {/* 내부 div에 클릭 반응 애니메이션 적용 */}
        <motion.div 
          className="relative w-[280px] h-[380px] rounded-2xl p-2 bg-white/90 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.03] backdrop-blur-sm"
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          style={{ willChange: "transform" }}
        >
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-white">
            <Image 
              src={src} 
              alt={`Gallery photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="280px"
              priority={index < 3}
              style={{ pointerEvents: 'none' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Thank You Message Component
function ThankYouMessage({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  // 0.78에서 시작해서 0.8에 도착, 이후 유지
  const zPosition = useTransform(
    scrollProgress,
    [0.75, 0.80],
    [-500, 0]
  );

  const scale = useTransform(
    zPosition,
    [-500, 0],
    [0.8, 1]
  );

  const opacity = useTransform(
    zPosition,
    [-500, -200],
    [0, 1]
  );

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center z-50 text-center"
      style={{
        scale,
        opacity,
        willChange: "transform, opacity"
      }}
    >
      <Typography className="font-serif text-[1.4rem] tracking-[0.2em] text-black/80 font-medium mb-3">
        감사합니다
      </Typography>
      <Typography className="text-[0.65rem] tracking-[0.3em] text-black/40 font-light uppercase">
        Thank You
      </Typography>
    </motion.div>
  );
}
