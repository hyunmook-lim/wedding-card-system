'use client';

import { SectionProps } from '@/types/wedding';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import Image from 'next/image';

export default function TrendyTextBrideGroom({ isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const containerRef = useRef<HTMLElement>(null);
  
  // Sticky scroll 타겟은 scrollRef(StickySection 부모 컨테이너)를 기준으로 합니다.
  const { scrollYProgress } = useScroll({
    target: scrollRef || containerRef,
    offset: ['start start', 'end end'] 
  });

  // 스크롤 진행도 [0.3, 0.7] 구간에서 1차(신랑)는 위로 올라가고,
  // 2차(신부)는 아래에서 위로 올라오며 '밀어내기' 효과를 만듭니다.
  const y1 = useTransform(scrollYProgress, [0.3, 0.7], ['0%', '-100%']);
  const y2 = useTransform(scrollYProgress, [0.3, 0.7], ['100%', '0%']);
  
  // 투명도는 그대로 유지하거나 살짝 조절 가능 (필요시)
  const opacity1 = useTransform(scrollYProgress, [0.5, 0.7], [1, 1]);

  // 남자 이미지(groom-full.png)가 스크롤에 따라 오른쪽으로 약간 이동하는 효과
  const groomX = useTransform(scrollYProgress, [0, 0.5], [0, 30]);

  // 여자 이미지(bride-full.png)가 스크롤에 따라 오른쪽으로 약간 이동하는 효과
  const brideX = useTransform(scrollYProgress, [0.5, 1], [0, 30]);

  if (!isVisible) return null;

  return (
    <section ref={containerRef} className="relative w-full h-full">
      {/* 1차 Sticky 컴포넌트: 신랑 */}
      <motion.div 
        style={{ y: y1, opacity: opacity1 }}
        className="absolute inset-0 flex flex-col p-8 z-0 bg-white"
      >
        {/* 상단 텍스트 영역 (1/3 높이) */}
        <div className="flex-[0.33] flex flex-col items-end justify-center w-full">
          <p className="text-xl font-medium text-gray-900 text-center leading-relaxed">
            임재용 허미영의 장남<br/>
            현묵
          </p>
        </div>

        {/* 하단 그림 영역 (나머지 공간, 왼쪽 정렬) */}
        <div className="flex-[0.67] relative w-full">
          {/* 이미지 스택 영역 (부모 높이 100%, 부모 너비 안에서 object-contain으로 원본 비율 유지) */}
          <div className="relative w-full h-full">
            {/* groom-background-full.png */}
            <Image 
              src="/test-resources/bride-groom/groom-background-full.png"
              alt="Groom Background"
              fill
              className="object-contain"
              style={{ objectPosition: 'left bottom' }}
              priority
            />
            {/* groom-full.png: 스크롤 시 약간 오른쪽으로 이동 */}
            <motion.div 
              style={{ x: groomX }} 
              className="absolute inset-0 z-10 pointer-events-none"
            >
              <Image 
                src="/test-resources/bride-groom/groom-full.png"
                alt="Groom Full"
                fill
                className="object-contain"
                style={{ objectPosition: 'left bottom' }}
                priority
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 2차 Sticky 컴포넌트 */}
      <motion.div 
        style={{ y: y2 }}
        className="absolute inset-0 flex flex-col p-8 z-10 bg-white"
      >
        {/* 상단 텍스트 영역 (1/3 높이) */}
        <div className="flex-[0.33] flex flex-col items-start justify-center w-full">
          <p className="text-xl font-medium text-gray-900 text-center leading-relaxed">
            최상욱 심재술의 장녀<br/>
            최가람
          </p>
        </div>

        {/* 하단 그림 영역 (나머지 공간, 오른쪽 정렬) */}
        <div className="flex-[0.67] relative w-full">
          {/* 이미지 스택 영역 (부모 높이 100%, 부모 너비 안에서 object-contain으로 원본 비율 유지) */}
          <div className="relative w-full h-full">
            {/* bride-background.png */}
            <Image 
              src="/test-resources/bride-groom/bride-background.png"
              alt="Bride Background"
              fill
              className="object-contain"
              style={{ objectPosition: 'right bottom' }}
              priority
            />
            {/* bride-full.png: 스크롤 시 약간 오른쪽으로 이동 */}
            <motion.div 
              style={{ x: brideX }} 
              className="absolute inset-0 z-10 pointer-events-none"
            >
              <Image 
                src="/test-resources/bride-groom/bride-full.png"
                alt="Bride Full"
                fill
                className="object-contain"
                style={{ objectPosition: 'right bottom' }}
                priority
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
