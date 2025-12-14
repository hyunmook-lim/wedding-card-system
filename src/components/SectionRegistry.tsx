'use client';

import dynamic from 'next/dynamic';
import { SectionConfig } from '@/types/wedding';
import { ComponentType } from 'react';
import { SectionProps } from '@/types/wedding';

// Lazy load components
const BasicGreeting = dynamic(() => import('./sections/Greeting/BasicGreeting'));
const BasicBrideGroom = dynamic(() => import('./sections/BrideGroom/BasicBrideGroom'));
const MainIntro = dynamic(() => import('./sections/Intro/MainIntro'));

const BasicDate = dynamic(() => import('./sections/Date/BasicDate'));
const BasicLocation = dynamic(() => import('./sections/Location/BasicLocation'));
const BasicAccount = dynamic(() => import('./sections/Account/BasicAccount'));
const BasicGallery = dynamic(() => import('./sections/Gallery/BasicGallery'));

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
  return (
    <main className="w-full max-w-md mx-auto min-h-screen bg-white shadow-xl relative pb-20">
      {sections.map((section) => {
        const componentMap = SECTION_COMPONENTS[section.type];
        if (!componentMap) {
          console.warn(`Unknown section type: ${section.type}`);
          return null;
        }

        const Component = componentMap[section.variant] || componentMap['basic'];
        if (!Component) {
          console.warn(`Unknown variant "${section.variant}" for type "${section.type}"`);
          return null;
        }

        return (
          <Component 
            key={section.id} 
            config={section.content} 
            isVisible={section.isVisible} 
            // Pass global context or other props if needed
          />
        );
      })}
    </main>
  );
}
