'use client';

import dynamic from 'next/dynamic';
import { SectionConfig } from '@/types/wedding';
import { ComponentType, useState, useEffect } from 'react';
import { SectionProps } from '@/types/wedding';

// Lazy load components
const BasicGreeting = dynamic(() => import('./sections/1.Greeting/BasicGreeting'));
const VideoGreeting = dynamic(() => import('./sections/1.Greeting/VideoGreeting'));
const BasicBrideGroom = dynamic(() => import('./sections/2.BrideGroom/BasicBrideGroom'));
const CardBrideGroom = dynamic(() => import('./sections/2.BrideGroom/CardBrideGroom'));
const MainIntro = dynamic(() => import('./sections/0.Intro/MainIntro'));

const BasicDate = dynamic(() => import('./sections/3.Date/BasicDate'));
const TypingDate = dynamic(() => import('./sections/3.Date/TypingDate'));
const SoftTypingDate = dynamic(() => import('./sections/3.Date/SoftTypingDate'));
const BasicLocation = dynamic(() => import('./sections/4.Location/BasicLocation'));
const MemoLocation = dynamic(() => import('./sections/4.Location/MemoLocation'));
const BasicAccount = dynamic(() => import('./sections/5.Account/BasicAccount'));
const MaskedAccount = dynamic(() => import('./sections/5.Account/MaskedAccount'));
const BasicGallery = dynamic(() => import('./sections/6.Gallery/BasicGallery'));
const FlyingGallery = dynamic(() => import('./sections/6.Gallery/FlyingGallery'));

// Debug Wrapper
import SectionDebugWrapper from './dev/SectionDebugWrapper';
import { StickySection } from '@/components/ui/StickySection';

// Map types to components
const SECTION_COMPONENTS: Record<string, Record<string, ComponentType<SectionProps>>> = {
  greeting: {
    basic: BasicGreeting,
    video: VideoGreeting,
  },
  intro: {
    basic: MainIntro,
  },
  bride_groom: {
    basic: BasicBrideGroom,
    card: CardBrideGroom,
  },
  date: {
    basic: BasicDate,
    typing: TypingDate,
    soft: SoftTypingDate,
  },
  location: {
    basic: BasicLocation,
    memo: MemoLocation,
  },
  account: {
    basic: BasicAccount,
    masked: MaskedAccount,
  },
  gallery: {
    basic: FlyingGallery,
    flying: FlyingGallery,
    grid: BasicGallery,
  },
  // Add other sections here as they are created
};

// Define default heights for specific section variants
const SECTION_HEIGHTS: Record<string, Record<string, string>> = {
  greeting: {
    video: '4000px', // 500lvh -> 5 * 800
  },
  account: {
    masked: '2400px', // 300lvh -> 3 * 800
  },
  date: {
    typing: '3200px', // 200lvh -> 2 * 800
    soft: '3200px', // 200lvh -> 2 * 800
  },
  location: {
    memo: '3200px', // 300lvh -> 3 * 800
  },
  bride_groom: {
    card: '3200px', // 300lvh -> 3 * 800
  },
  gallery: {
    basic: '4000px',
    flying: '4000px',
  },
};



export default function SectionRegistry({ sections }: { sections: SectionConfig[] }) {
  const [showIntro, setShowIntro] = useState(true);

  // Intro 표시 중일 때 body 스크롤 차단
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showIntro]);

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // 1. Separate 'intro' from other sections
  const introSection = sections.find(s => s.type === 'intro');
  const otherSections = sections.filter(s => s.type !== 'intro');

  // 2. Render Intro Overlay
  const renderIntro = () => {
    if (!introSection || !showIntro) return null;
    
    // Intro logic mapping
    const componentMap = SECTION_COMPONENTS[introSection.type];
    const Component = componentMap?.[introSection.variant] || componentMap?.['basic'];
    
    if (!Component) return null;

    return (
      <div className="absolute inset-0 z-[100] transition-opacity duration-1000 ease-in-out">
         <Component 
            key={introSection.id}
            config={introSection.content}
            isVisible={introSection.isVisible}
            onEnter={() => setShowIntro(false)}
         />
      </div>
    );
  };

  return (
    <main className="w-full max-w-md mx-auto min-h-screen bg-[#fffdf7] shadow-xl relative pb-20">
      
      {/* Render Intro Overlay */}
      {renderIntro()}

      {/* Render Main Content (only visible after intro is gone, or keep it behind) */}
      <div className={`${showIntro ? 'overflow-hidden h-screen' : ''}`}>
        {otherSections.map((section, index) => {
            if (!section.isVisible) return null;

            const componentMap = SECTION_COMPONENTS[section.type];
            if (!componentMap) return null;

            const Component = componentMap[section.variant] || componentMap['basic'];
            if (!Component) return null;

        // Define scroll heights for specific sections
        const height = SECTION_HEIGHTS[section.type]?.[section.variant] || '800px';

        return (
          <SectionDebugWrapper key={section.id} type={section.type} index={index}>
            <StickySection index={index} height={height}>
              <Component 
                  config={section.content} 
                  isVisible={section.isVisible} 
              />
            </StickySection>
          </SectionDebugWrapper>
        );
      })}
      </div>
    </main>
  );
}

