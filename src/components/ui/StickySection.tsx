'use client';

import { ReactNode, useRef } from 'react';
import { StickyScrollContext } from './StickyScrollContext';

interface StickySectionProps {
  children: ReactNode;
  height?: string; // Total scroll height (e.g. "300vh")
  index: number;   // For z-index stacking
  className?: string; // Extra classes for the internal sticky container
}

export function StickySection({ children, height = '100lvh', index, className = '' }: StickySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // For the first section (index 0), use negative margin to make it visible from the start
  const isFirst = index === 0;
  const marginTop = isFirst ? '-100lvh' : '0';
  
  return (
    <div 
      ref={containerRef}
      style={{ height, marginTop, zIndex: index }} 
      className="relative w-full"
    >
      <StickyScrollContext.Provider value={containerRef as unknown as React.RefObject<HTMLElement>}>
        <div className={`sticky top-0 h-[100lvh] w-full overflow-hidden bg-white ${className}`}>
          {children}
        </div>
      </StickyScrollContext.Provider>
    </div>
  );
}
