'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useContext } from 'react';
import { StickyScrollContext } from '../ui/StickyScrollContext';
import Image from 'next/image';

interface ImageBackgroundProps {
  imageUrl: string;
}

export default function ImageBackground({ imageUrl }: ImageBackgroundProps) {
  // StickySection에서 쏫아준 containerRef를 가져와서 스크롤 기준으로 삼습니다.
  const containerRef = useContext(StickyScrollContext);

  // 컨테이너 내의 스크롤 진행도를 0 ~ 1로 추적합니다.
  const { scrollYProgress } = useScroll({
    target: containerRef as React.RefObject<HTMLElement>, // Fix type issue
    // 컨테이너의 맨 위가 뷰포트 맨 위일 때 0, 컨테이너의 맨 밑이 뷰포트 맨 밑일 때 1
    offset: ['start start', 'end end'],
  });

  // 스크롤 트랜잭션 정의:
  // 1. Zoom (크기 확대): 스크롤 하는 동안 1배에서 1.3배로 부드럽게 커짐
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  
  // 2. Fade-out (투명도): 다음 섹션으로 넘어갈 때 (스크롤 80% 지점부터) 서서히 어두워짐
  const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0.3]);

  return (
    <motion.div
      className="absolute inset-0 z-0 origin-center w-full h-full object-cover"
      style={{ scale, opacity }}
    >
      <Image 
        src={imageUrl} 
        alt="Background" 
        fill
        className="object-cover"
        priority // 배경 이미지이므로 우선 로딩 권장
        unoptimized // 임시/외부 url용
      />
      {/* 텍스트 가독성을 위한 살짝 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/20" />
    </motion.div>
  );
}
