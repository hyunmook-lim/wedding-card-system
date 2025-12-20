'use client';

import dynamic from 'next/dynamic';
import { SectionConfig } from '@/types/wedding';
import { ComponentType, useState, useEffect } from 'react';
import { SectionProps } from '@/types/wedding';

// Lazy load components
const BasicGreeting = dynamic(() => import('./sections/1.Greeting/BasicGreeting'));
const BasicBrideGroom = dynamic(() => import('./sections/2.BrideGroom/BasicBrideGroom'));
const MainIntro = dynamic(() => import('./sections/0.Intro/MainIntro'));

const BasicDate = dynamic(() => import('./sections/3.Date/BasicDate'));
const BasicLocation = dynamic(() => import('./sections/4.Location/BasicLocation'));
const BasicAccount = dynamic(() => import('./sections/5.Account/BasicAccount'));
const BasicGallery = dynamic(() => import('./sections/6.Gallery/BasicGallery'));

// Map types to components
const SECTION_COMPONENTS: Record<string, Record<string, ComponentType<SectionProps>>> = {
  greeting: {
    basic: BasicGreeting,
  },
  intro: {
    basic: MainIntro,
  },
  bride_groom: {
    basic: BasicBrideGroom,
  },
  date: {
    basic: BasicDate,
  },
  location: {
    basic: BasicLocation,
  },
  account: {
    basic: BasicAccount,
  },
  gallery: {
    basic: BasicGallery,
  },
  // Add other sections here as they are created
};

export default function SectionRegistry({ sections }: { sections: SectionConfig[] }) {
  const [showIntro, setShowIntro] = useState(true);

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
      <div className="fixed inset-0 z-[100] transition-opacity duration-1000 ease-in-out">
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
    <main className="w-full max-w-md mx-auto min-h-screen bg-white shadow-xl relative pb-20">
      
      {/* Render Intro Overlay */}
      {renderIntro()}

      {/* Render Main Content (only visible after intro is gone, or keep it behind) */}
      <div className={`transition-opacity duration-1000 ${showIntro ? 'opacity-0 overflow-hidden h-screen' : 'opacity-100'}`}>
        {otherSections.map((section) => {
            const componentMap = SECTION_COMPONENTS[section.type];
            if (!componentMap) return null;

            const Component = componentMap[section.variant] || componentMap['basic'];
            if (!Component) return null;

            return (
            <Component 
                key={section.id} 
                config={section.content} 
                isVisible={section.isVisible} 
            />
            );
        })}
      </div>
    </main>
  );
}
