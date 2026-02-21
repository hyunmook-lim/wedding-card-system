'use client';

import { ReactNode, useRef } from 'react';
import { BackgroundConfig } from '@/types/wedding';
import BackgroundRenderer from '../backgrounds/BackgroundRenderer';
import { StickyScrollContext } from './StickyScrollContext';

interface StickySectionProps {
  children: ReactNode;
  height?: string; // Total scroll height (e.g. "300vh")
  index: number;   // For z-index stacking
  className?: string; // Extra classes for the internal sticky container
  background?: BackgroundConfig; // 배경 설정 Prop 추가
}

export function StickySection({ children, height = '800px', index, className = '', background }: StickySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={containerRef}
      style={{ height, zIndex: index }} 
      className="relative w-full"
    >
      <StickyScrollContext.Provider value={containerRef as unknown as React.RefObject<HTMLElement>}>
        <div className={`sticky top-0 h-[100dvh] w-full overflow-hidden ${className}`}>
          {/* 1. 배경 레이어 (맨 뒤, z-0) */}
          <BackgroundRenderer config={background} />

          {/* 2. 실제 컨텐츠 레이어 (배경 위, z-10) */}
          <div className="relative z-10 w-full h-full">
            {children}
          </div>
        </div>
      </StickyScrollContext.Provider>
    </div>
  );
}

