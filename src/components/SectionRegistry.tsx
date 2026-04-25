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
const BasicBrideGroom = dynamic(() => import('./sections/2.BrideGroom/BasicBrideGroom'));
const CardBrideGroom = dynamic(() => import('./sections/2.BrideGroom/CardBrideGroom'));
const TrendyTextBrideGroom = dynamic(() => import('./sections/2.BrideGroom/TrendyTextBrideGroom'));
const MainIntro = dynamic(() => import('./sections/0.Intro/MainIntro'));

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
  },
  intro: {
    basic: MainIntro,
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
  const [isAROpen, setIsAROpen] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Refs for dynamic background triggers... (omitted but I should keep them)
  const fadeInRef = useRef<HTMLDivElement>(null);
  const fadeOutRef = useRef<HTMLDivElement>(null);

  // AR Overlay Config (since it's now a global feature)
  const arConfig = {
    targetImage: '/test-resources/ar/target-image.mind',
    videoUrl: '/test-resources/ar/test-video.MP4',
    title: 'AR 초대장',
    subtitle: '명함의 뒷면을 카메라에 비춰보세요'
  };

  // Intro 표시 중일 때 body 스크롤 차단
  useEffect(() => {
    if (showIntro || isAROpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showIntro, isAROpen]);

  useEffect(() => {
    if (showIntro && !isPreloading) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 3000);
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

      {/* AR Floating Button (Only visible after intro) */}
      <AnimatePresence>
        {!showIntro && !isAROpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-8 right-8 z-[90] cursor-pointer"
            onClick={() => setIsAROpen(true)}
          >
            {/* Liquid Glass Styled Button (Smaller) */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-amber-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative w-11 h-11 bg-white/40 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 active:scale-95">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black text-black/60 tracking-tighter leading-none mb-0.5">AR</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/60">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen AR Overlay */}
      <AnimatePresence>
        {isAROpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
            {/* Render AR Component */}
            <div className="flex-1 w-full bg-black overflow-hidden mt-0">
               <ARCardScan 
                 config={arConfig} 
                 isVisible={true} 
                 onClose={() => setIsAROpen(false)}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

