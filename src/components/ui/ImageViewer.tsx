import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useState, useCallback, useEffect } from 'react';

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewer({ images, initialIndex, isOpen, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0); // 슬라이드 방향 (-1: 왼쪽, 1: 오른쪽)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Props 변화에 따른 상태 초기화 (렌더링 중 수행하여 cascading render 방지)
  if (isOpen && !prevIsOpen) {
    setCurrentIndex(initialIndex);
    setDirection(0);
    setPrevIsOpen(true);
  }
  if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  // 스크롤 잠금 효과 (Side Effect만 처리)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // 스와이프 핸들러
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      goToPrev();
    } else if (info.offset.x < -threshold) {
      goToNext();
    }
  };

  // 키보드 네비게이션
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrev();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
  }, [goToPrev, goToNext, onClose]);

  // 슬라이드 애니메이션 Variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction === 0 ? 0 : (direction > 0 ? 1000 : -1000),
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden" 
          onClick={onClose}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* 이미지 컨테이너 (가운데 배치) */}
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                onClick={(e) => e.stopPropagation()}
                className="absolute w-full h-full flex items-center justify-center p-4" 
              >
                <div className="relative w-full h-full max-w-screen-lg max-h-screen p-4"> 
                  <Image
                    src={images[currentIndex]}
                    alt={`Photo ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* UI 컨트롤 (이미지 위에 띄움 - pointer-events-none 컨테이너 안에서 버튼만 auto로 설정) */}
          <div className="absolute inset-0 pointer-events-none z-[1000]">
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 text-white hover:text-gray-300 transition-colors bg-black/40 rounded-full pointer-events-auto backdrop-blur-sm"
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* 이전 버튼 */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:text-gray-300 transition-colors bg-black/40 rounded-full pointer-events-auto backdrop-blur-sm"
              aria-label="이전 사진"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* 다음 버튼 */}
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:text-gray-300 transition-colors bg-black/40 rounded-full pointer-events-auto backdrop-blur-sm"
              aria-label="다음 사진"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* 인디케이터 (화면 하단 고정) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx); 
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`사진 ${idx + 1}로 이동`}
                />
              ))}
            </div>

            {/* 카운터 (화면 상단 고정) */}
            <div className="absolute top-6 left-6 text-white text-sm font-medium drop-shadow-md select-none">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(content, document.body);
}
