'use client';

import { SectionProps } from '@/types/wedding';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

function RevealContainer({ 
  children 
}: { 
  children: (isVisible: boolean) => React.ReactNode; 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // 화면 아래로(bottom) 빠져나가는 경우에만 초기화
          if (entry.boundingClientRect.top > 0) {
            setIsVisible(false);
          }
        }
      },
      { 
        threshold: 0, 
        rootMargin: '0px 0px -45% 0px' 
      }
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div ref={ref} className="w-full flex flex-col items-center px-8 gap-24">
      {children(isVisible)}
    </div>
  );
}

export default function TrendyTextBrideGroom({ config, isVisible: sectionVisible }: SectionProps) {
  if (!sectionVisible) return null;

  const { groom, bride } = config as { 
    groom: { name: string; nameEng?: string; relation: string; parents: { father: string; mother: string } };
    bride: { name: string; nameEng?: string; relation: string; parents: { father: string; mother: string } };
  };

  return (
    <section className="w-full flex flex-col items-center py-32 gap-32 overflow-hidden">
      {/* ---------- 신랑 영역 ---------- */}
      <RevealContainer>
        {(isVisible) => (
          <>
            <div className={`w-full flex flex-col items-end text-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? 'opacity-100 translate-y-0 text-gray-900' : 'opacity-0 translate-y-8 text-gray-400'
            }`}>
              <div className="flex flex-col items-center">
                <span className="text-xl font-semibold tracking-widest">{groom?.name?.slice(1)}</span>
                <span className="text-sm font-light text-gray-400 tracking-[0.3em] mt-2 uppercase">{groom?.nameEng || 'YOUNG HOO'}</span>
                
                <div className="mt-6 text-lg font-normal tracking-widest flex items-center justify-center gap-2">
                  {groom?.parents.father} <span className="text-gray-300 font-light">ㅣ</span> {groom?.parents.mother}
                </div>
                <span className="text-base text-gray-500 mt-1 tracking-widest">{groom?.relation}</span>
              </div>
            </div>

            {/* 이미지 영역 */}
            <div className="w-full aspect-[4/5] relative">
              {/* 배경 이미지는 고정 */}
              <Image 
                src="/test-resources/bride-groom/groom-background-full.png"
                alt="Groom Background"
                fill
                className="object-contain"
                style={{ objectPosition: 'left bottom' }}
                priority
              />
              {/* 인물 이미지는 살짝 왼쪽에서 시작해서 제자리(0)로 이동 */}
              <div className={`absolute top-0 left-0 bottom-0 w-[80%] z-10 pointer-events-none transition-transform duration-1000 delay-100 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isVisible ? 'translate-x-12' : '-translate-x-4'
              }`}>
                <Image 
                  src="/test-resources/bride-groom/groom-full.png"
                  alt="Groom Full"
                  fill
                  className="object-contain"
                  style={{ objectPosition: 'left bottom' }}
                  priority
                />
              </div>
            </div>
          </>
        )}
      </RevealContainer>

      {/* ---------- 신부 영역 ---------- */}
      <RevealContainer>
        {(isVisible) => (
          <>
            {/* 텍스트 영역 */}
            <div className={`w-full flex flex-col items-start text-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? 'opacity-100 translate-y-0 text-gray-900' : 'opacity-0 translate-y-8 text-gray-400'
            }`}>
              <div className="flex flex-col items-center">
                <span className="text-xl font-semibold tracking-widest">{bride?.name?.slice(1)}</span>
                <span className="text-sm font-light text-gray-400 tracking-[0.3em] mt-2 uppercase">{bride?.nameEng || 'YE EUN'}</span>
                
                <div className="mt-6 text-lg font-normal tracking-widest flex items-center justify-center gap-2">
                  {bride?.parents.father} <span className="text-gray-300 font-light">ㅣ</span> {bride?.parents.mother}
                </div>
                <span className="text-base text-gray-500 mt-1 tracking-widest">{bride?.relation}</span>
              </div>
            </div>

            {/* 이미지 영역 */}
            <div className="w-full aspect-[4/5] relative">
              {/* 배경 이미지는 고정 */}
              <Image 
                src="/test-resources/bride-groom/bride-background.png"
                alt="Bride Background"
                fill
                className="object-contain"
                style={{ objectPosition: 'right bottom' }}
                priority
              />
              {/* 인물 이미지는 살짝 오른쪽에서 시작해서 제자리(0)로 이동 */}
              <div className={`absolute top-0 right-0 bottom-0 w-[80%] z-10 pointer-events-none transition-transform duration-1000 delay-100 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isVisible ? 'translate-x-0' : 'translate-x-16'
              }`}>
                <Image 
                  src="/test-resources/bride-groom/bride-full-changed.png"
                  alt="Bride Full"
                  fill
                  className="object-contain"
                  style={{ objectPosition: 'right bottom' }}
                  priority
                />
              </div>
            </div>
          </>
        )}
      </RevealContainer>
    </section>
  );
}
