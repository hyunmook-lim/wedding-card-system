'use client';

import dynamic from 'next/dynamic';
import { SectionConfig, BackgroundConfig } from '@/types/wedding';
import { ComponentType, useState, useEffect, useRef } from 'react';
import { SectionProps } from '@/types/wedding';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PreloadedMediaContext, PreloadedMediaMap } from '@/lib/preloaded-media-context';

// Lazy load components
const BasicGreeting = dynamic(() => import('./sections/1.Greeting/BasicGreeting'));
const VideoGreeting = dynamic(() => import('./sections/1.Greeting/VideoGreeting'));
const VideoGreeting2 = dynamic(() => import('./sections/1.Greeting/VideoGreeting2'));
const PolaroidGreeting = dynamic(() => import('./sections/1.Greeting/PolaroidGreeting'));
const PolaroidGreeting2 = dynamic(() => import('./sections/1.Greeting/PolaroidGreeting2'));
const BasicBrideGroom = dynamic(() => import('./sections/2.BrideGroom/BasicBrideGroom'));
const CardBrideGroom = dynamic(() => import('./sections/2.BrideGroom/CardBrideGroom'));
const TrendyTextBrideGroom = dynamic(() => import('./sections/2.BrideGroom/TrendyTextBrideGroom'));
import MainIntro from './sections/0.Intro/MainIntro';
import BasicIntro from './sections/0.Intro/BasicIntro';

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
    video2: '150lvh', // scroll animation for blur effect
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
  /**
   * 프리로딩 중 누적용 ref (리렌더 없이 빠르게 쌓음)
   * 완료 시 preloadedMedia state로 한 번만 스냅샷
   */
  const preloadedMediaRef = useRef<PreloadedMediaMap>(new Map());
  const [preloadedMedia, setPreloadedMedia] = useState<PreloadedMediaMap>(new Map());

  // Intro 표시 중일 때 body 스크롤 차단
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showIntro]);

  // Preloading Logic — track ALL resources so isPreloading stays true until everything is ready
  useEffect(() => {
    const introSection = sections.find(s => s.type === 'intro');
    const introContent = introSection?.content as Record<string, unknown> | undefined;
    const introVideo: string | undefined =
      (typeof introContent?.introVideo === 'string' ? introContent.introVideo : undefined) ?? '/test-resources/intro.mp4';

    // --- Collect every URL from all section configs ---
    const allUrls = new Set<string>();
    const extractUrls = (obj: unknown) => {
      if (!obj) return;
      if (typeof obj === 'string') {
        if (obj.match(/\.(jpeg|jpg|gif|png|webp|svg|mp4|webm|mp3|wav)$/i)) {
          allUrls.add(obj);
        }
      } else if (typeof obj === 'object') {
        Object.values(obj as Record<string, unknown>).forEach(extractUrls);
      }
    };
    sections.forEach(s => extractUrls(s.content));

    // --- Build unified task list ---
    const tasks: Array<() => Promise<void>> = [];

    // 1. Font
    tasks.push(
      () =>
        new Promise<void>((resolve) => {
          if (document.fonts) {
            document.fonts.load('16px GowunDodum').then(() => resolve()).catch(() => resolve());
          } else {
            resolve();
          }
        })
    );

    // 2. Intro video (highest priority — but still counted in the same list)
    if (introVideo) {
      tasks.push(
        () =>
          new Promise<void>((resolve) => {
            const video = document.createElement('video');
            video.oncanplaythrough = () => resolve();
            video.onerror = () => resolve();
            video.preload = 'auto';
            video.src = introVideo;
            video.load();
          })
      );
    }

    // 3. All other media from sections
    allUrls.forEach(url => {
      if (url === introVideo) return; // already added above
      if (url.match(/\.(mp4|webm)$/i)) {
        tasks.push(
          () =>
            new Promise<void>((resolve) => {
              const v = document.createElement('video');
              v.muted = true;
              v.playsInline = true;
              v.preload = 'auto';
              // 스타일을 미리 설정 → VideoGreeting2에서 뮤테이션 불필요
              v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
              v.oncanplaythrough = () => {
                preloadedMediaRef.current.set(url, v);
                resolve();
              };
              v.onerror = () => resolve();
              v.src = url;
              v.load();
            })
        );
      } else if (url.match(/\.(mp3|wav)$/i)) {
        tasks.push(
          () =>
            new Promise<void>((resolve) => {
              const a = new Audio();
              a.oncanplaythrough = () => resolve();
              a.onerror = () => resolve();
              a.preload = 'auto';
              a.src = url;
              a.load();
            })
        );
      } else {
        tasks.push(
          () =>
            new Promise<void>((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = url;
            })
        );
      }
    });

    // --- Run all tasks in parallel and track progress ---
    const total = tasks.length;
    if (total === 0) {
      setLoadingProgress(100);
      setTimeout(() => setIsPreloading(false), 300);
      return;
    }

    let completed = 0;
    const onOneDone = () => {
      completed++;
      setLoadingProgress(Math.round((completed / total) * 100));
      if (completed >= total) {
        setTimeout(() => setIsPreloading(false), 300);
      }
    };

    tasks.forEach(task => task().then(onOneDone));

    // 프리로딩 완료 시 ref → state 스냅샷 (Provider에 새 Map 인스턴스 전달)
    // setIsPreloading 이후에 실행되도록 tasks 완료 후 동일 타이밍에 실행
    Promise.all(tasks.map(t => t())).catch(() => {}).finally(() => {
      setPreloadedMedia(new Map(preloadedMediaRef.current));
    });
  }, [sections]);


  useEffect(() => {
    if (showIntro && !isPreloading) {
      const introSection = sections.find(s => s.type === 'intro');
      const isVideoIntro = introSection?.variant === 'video';
      // 비디오 인트로: 로딩 완료 직후 전환 / 기본 인트로: 6초 애니메이션 대기
      const delay = isVideoIntro ? 1500 : 6000;
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [showIntro, isPreloading, sections]);

  const fadeInRef = useRef<HTMLDivElement>(null);
  const fadeOutRef = useRef<HTMLDivElement>(null);

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
    <PreloadedMediaContext.Provider value={preloadedMedia}>
      <main className={cn(
        "w-full max-w-md mx-auto min-h-screen shadow-xl relative transition-colors duration-500",
        showIntro ? "bg-white" : "bg-transparent"
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

        {/* Render Main Content (only after intro) */}
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
    </PreloadedMediaContext.Provider>
  );
}

