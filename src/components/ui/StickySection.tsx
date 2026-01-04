'use client';

import { ReactNode, useRef } from 'react';
import { StickyScrollContext } from './StickyScrollContext';

interface StickySectionProps {
  children: ReactNode;
  height?: string; // Total scroll height (e.g. "300vh")
  index: number;   // For z-index stacking
  className?: string; // Extra classes for the internal sticky container
}

export function StickySection({ children, height = '800px', index, className = '' }: StickySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={containerRef}
      style={{ height, zIndex: index }} 
      className="relative w-full"
    >
      <StickyScrollContext.Provider value={containerRef as unknown as React.RefObject<HTMLElement>}>
        <div className={`sticky top-0 h-[800px] w-full overflow-hidden bg-white ${className}`}>
          {children}
        </div>
      </StickyScrollContext.Provider>
    </div>
  );
}
