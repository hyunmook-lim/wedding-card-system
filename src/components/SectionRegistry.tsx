'use client';

import dynamic from 'next/dynamic';
import { SectionConfig, BackgroundConfig } from '@/types/wedding';
import { ComponentType, useState, useEffect, useRef } from 'react';
import { SectionProps } from '@/types/wedding';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Lazy load components
const BasicGreeting = dynamic(() => import('./sections/1.Greeting/BasicGreeting'));
const VideoGreeting = dynamic(() => import('./sections/1.Greeting/VideoGreeting'));
const VideoGreeting2 = dynamic(() => import('./sections/1.Greeting/VideoGreeting2'));
const PolaroidGreeting = dynamic(() => import('./sections/1.Greeting/PolaroidGreeting'));
const PolaroidGreeting2 = dynamic(() => import('./sections/1.Greeting/PolaroidGreeting2'));
const BasicBrideGroom = dynamic(() => import('./sections/2.BrideGroom/BasicBrideGroom'));
const CardBrideGroom = dynamic(() => import('./sections/2.BrideGroom/CardBrideGroom'));
const TrendyTextBrideGroom = dynamic(() => import('./sections/2.BrideGroom/TrendyTextBrideGroom'));
const MainIntro = dynamic(() => import('./sections/0.Intro/MainIntro'));
const BasicIntro = dynamic(() => import('./sections/0.Intro/BasicIntro'));

const BasicDate = dynamic(() => import('./sections/3.Date/BasicDate'));
const TypingDate = dynamic(() => import('./sections/3.Date/TypingDate'));
const SoftTypingDate = dynamic(() => import('./sections/3.Date/SoftTypingDate'));
const FlipBoardDate = dynamic(() => import('./sections/3.Date/FlipBoardDate'));
const NewmorphismCalendar = dynamic(() => import('./sections/3.Date/NewmorphismCalendar'));
const BasicLocation = dynamic(() => import('./sections/4.Location/BasicLocation'));
const NewmorphismLocation = dynamic(() => import('./sections/4.Location/NewmorphismLocation'));
const GlassmorphismLocation = dynamic(() => import('./sections/4.Location/GlassmorphismLocation'));

const GlassmorphismCalendar = dynamic(() => import('./sections/3.Date/GlassmorphismCalendar'));
const BasicAccount = dynamic(() => import('./sections/5.Account/BasicAccount'));
const GlassmorphismAccount = dynamic(() => import('./sections/5.Account/GlassmorphismAccount'));
const BasicGallery = dynamic(() => import('./sections/6.Gallery/BasicGallery'));
const FlyingGallery = dynamic(() => import('./sections/6.Gallery/FlyingGallery'));
const AlbumGallery = dynamic(() => import('./sections/6.Gallery/AlbumGallery'));
const ARViewer = dynamic(() => import('./sections/7.special/ARViewer'));
const ARCardScan = dynamic(() => import('./sections/7.special/ARCardScan'));
const GlassmorphismMemories = dynamic(() => import('./sections/8.Memories/GlassmorphismMemories'));

// Debug Wrapper
import SectionDebugWrapper from './dev/SectionDebugWrapper';
import { StickySection } from '@/components/ui/StickySection';
import AdaptiveBackground from './backgrounds/AdaptiveBackground';

// Map types to components
const SECTION_COMPONENTS: Record<string, Record<string, ComponentType<SectionProps>>> = {
  greeting: {
    basic: BasicGreeting,
    video: VideoGreeting,
    video2: VideoGreeting2,
    polaroid: PolaroidGreeting,
    polaroid2: PolaroidGreeting2,
  },
  intro: {
    basic: BasicIntro,
    video: MainIntro,
  },
  bride_groom: {
    basic: BasicBrideGroom,
    card: CardBrideGroom,
    trendy: TrendyTextBrideGroom,
  },
  date: {
    basic: BasicDate,
    typing: TypingDate,
    soft: SoftTypingDate,
    flipboard: FlipBoardDate,
    calendar: NewmorphismCalendar,
    glass: GlassmorphismCalendar,
  },
  location: {
    basic: BasicLocation,
    memo: NewmorphismLocation,
    glass: GlassmorphismLocation,
  },
  account: {
    basic: BasicAccount,
    masked: GlassmorphismAccount,
  },
  gallery: {
    basic: FlyingGallery,
    flying: FlyingGallery,
    grid: BasicGallery,
    album: AlbumGallery,
  },
  ar_viewer: {
    basic: ARViewer,
    card_scan: ARCardScan,
  },
  memories: {
    glass: GlassmorphismMemories,
  },
  // Add other sections here as they are created
};

// Define default heights for specific section variants
const SECTION_HEIGHTS: Record<string, Record<string, string>> = {
  greeting: {
    video: '4000px', // 500lvh -> 5 * 800
    video2: '4000px',
    polaroid: '4000px',
    polaroid2: '5000px',
  },
  account: {
    masked: '1200px', // 150lvh -> 1.5 * 800
  },
  date: {
    typing: '3200px', // 200lvh -> 2 * 800
    soft: '3200px', // 200lvh -> 2 * 800
    flipboard: '1600px',
    calendar: '1200px',
    glass: '2000px',
  },
  location: {
    memo: '1200px', // 150lvh -> 1.5 * 800
    glass: '3000px',
  },
  bride_groom: {
    card: '3200px', // 300lvh -> 3 * 800
    trendy: '2400px', // 200lvh -> 2 * 800
  },
  gallery: {
    basic: '4000px',
    flying: '4000px',
    album: '4000px',
  },
  ar_viewer: {
    basic: '100lvh',
    card_scan: '100lvh', // Changed to 100lvh to prevent unsticking by default
  },
  memories: {
    glass: '2400px',
  },
};



export default function SectionRegistry({ sections }: { sections: SectionConfig[] }) {
  const [showIntro, setShowIntro] = useState(true);
  const [isPreloading, setIsPreloading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Refs for dynamic background triggers... (omitted but I should keep them)
  const fadeInRef = useRef<HTMLDivElement>(null);
  const fadeOutRef = useRef<HTMLDivElement>(null);


  // Intro 표시 중일 때 body 스크롤 차단
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showIntro]);

  useEffect(() => {
    if (showIntro && !isPreloading) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 6000); // 6초로 늘려 BasicIntro 애니메이션이 잘리지 않도록 보호
      return () => clearTimeout(timer);
    }
  }, [showIntro, isPreloading]);

  // Preload all section images while intro is playing
  useEffect(() => {
    const imageUrls: string[] = [];

    // Recursively collect image URLs from section configs
    const collectImages = (obj: unknown) => {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          if (typeof item === 'string' && /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(item)) {
            imageUrls.push(item);
          } else {
            collectImages(item);
          }
        });
        return;
      }
      for (const value of Object.values(obj as Record<string, unknown>)) {
        if (typeof value === 'string' && /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(value)) {
          imageUrls.push(value);
        } else {
          collectImages(value);
        }
      }
    };

    sections.forEach(s => collectImages(s.content));

    if (imageUrls.length === 0) {
      setIsPreloading(false);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    // Preload in batches to avoid overwhelming the network
    const BATCH_SIZE = 10;
    
    const loadImages = async () => {
      for (let i = 0; i < imageUrls.length; i += BATCH_SIZE) {
        const batch = imageUrls.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(url => new Promise(resolve => {
          const img = new window.Image();
          img.onload = () => {
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
            resolve(true);
          };
          img.onerror = () => {
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
            resolve(true); // Ignore errors and continue
          };
          img.src = url;
        })));
      }
      setIsPreloading(false);
    };

    loadImages();
  }, [sections]);

  // 1. Separate 'intro' from other sections
  const introSection = sections.find(s => s.type === 'intro');
  const otherSections = sections.filter(s => s.type !== 'intro');
  const visibleSections = otherSections.filter(s => s.isVisible);
  const lastSectionId = visibleSections[visibleSections.length - 1]?.id;

  // 2. Render Intro Overlay
  const renderIntro = () => {
    if (!introSection) return null;

    const componentMap = SECTION_COMPONENTS[introSection.type];
    const Component = componentMap?.[introSection.variant] || componentMap?.['basic'];
    
    if (!Component) return null;

    return (
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            key="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-[100]"
          >
             <Component 
                key={introSection.id}
                config={introSection.content}
                isVisible={introSection.isVisible}
                onEnter={() => setShowIntro(false)}
                isPreloading={isPreloading}
                loadingProgress={loadingProgress}
             />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <main className={cn(
      "w-full max-w-md mx-auto min-h-screen shadow-xl relative transition-colors duration-500",
      showIntro ? "bg-black" : "bg-transparent"
    )}>
      
      {/* Render Intro Overlay */}
      {renderIntro()}

      {/* Dynamic Global Background (Render only after intro) */}
      {!showIntro && (
        <AdaptiveBackground 
          fadeInTargetRef={fadeInRef} 
          fadeOutTargetRef={fadeOutRef} 
        />
      )}

      {/* Render Main Content (Render only after intro) */}
      {!showIntro && (
        <div className="animate-in fade-in duration-1000">
          {otherSections.map((section, index) => {
            if (!section.isVisible) return null;

            const componentMap = SECTION_COMPONENTS[section.type];
            if (!componentMap) return null;

            const Component = componentMap[section.variant] || componentMap['basic'];
            if (!Component) return null;

        const isLast = section.id === lastSectionId;
        const definedHeight = SECTION_HEIGHTS[section.type]?.[section.variant];
        const height = isLast 
          ? (definedHeight || '100dvh') 
          : (definedHeight || '800px');

        return (
          <SectionDebugWrapper key={section.id} type={section.type} index={index}>
            <div ref={section.id === 'sec_memories' ? fadeInRef : section.id === 'sec_8' ? fadeOutRef : null}>
              <StickySection 
                  index={index} 
                  height={height}
                  background={section.content.background as BackgroundConfig}
                  isSticky={section.content.isSticky !== false}
              >
                <Component 
                    config={section.content} 
                    isVisible={section.isVisible} 
                />
              </StickySection>
            </div>
          </SectionDebugWrapper>
        );
      })}
      </div>
      )}

    </main>
  );
}

