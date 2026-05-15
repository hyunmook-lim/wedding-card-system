'use client';

import { WeddingConfig, BackgroundConfig, SectionConfig, SectionProps } from '@/types/wedding';
import { ComponentType, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PreloadedMediaContext, PreloadedMediaMap, IntroFadedContext } from '@/lib/preloaded-media-context';

// Lazy load components
import BasicGreeting from './sections/1.Greeting/BasicGreeting';
import VideoGreeting from './sections/1.Greeting/VideoGreeting';
import VideoGreeting2 from './sections/1.Greeting/VideoGreeting2';
import PolaroidGreeting from './sections/1.Greeting/PolaroidGreeting';
import PolaroidGreeting2 from './sections/1.Greeting/PolaroidGreeting2';
import BasicBrideGroom from './sections/2.BrideGroom/BasicBrideGroom';
import CardBrideGroom from './sections/2.BrideGroom/CardBrideGroom';
import TrendyTextBrideGroom from './sections/2.BrideGroom/TrendyTextBrideGroom';
import MainIntro from './sections/0.Intro/MainIntro';
import BasicIntro from './sections/0.Intro/BasicIntro';

import BasicDate from './sections/3.Date/BasicDate';
import TypingDate from './sections/3.Date/TypingDate';
import SoftTypingDate from './sections/3.Date/SoftTypingDate';
import FlipBoardDate from './sections/3.Date/FlipBoardDate';
import NewmorphismCalendar from './sections/3.Date/NewmorphismCalendar';
import BasicLocation from './sections/4.Location/BasicLocation';
import NewmorphismLocation from './sections/4.Location/NewmorphismLocation';
import GlassmorphismLocation from './sections/4.Location/GlassmorphismLocation';

import GlassmorphismCalendar from './sections/3.Date/GlassmorphismCalendar';
import BasicAccount from './sections/5.Account/BasicAccount';
import GlassmorphismAccount from './sections/5.Account/GlassmorphismAccount';
import BasicGallery from './sections/6.Gallery/BasicGallery';
import FlyingGallery from './sections/6.Gallery/FlyingGallery';
import AlbumGallery from './sections/6.Gallery/AlbumGallery';
import ARViewer from './sections/7.special/ARViewer';
import ARCardScan from './sections/7.special/ARCardScan';
import GlassmorphismMemories from './sections/8.Memories/GlassmorphismMemories';

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



export default function SectionRegistry({ wedding }: { wedding: WeddingConfig }) {
  const { sections } = wedding;
  const [showIntro, setShowIntro] = useState(true);
  const [isPreloading, setIsPreloading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  /**
   * 프리로딩 중 누적용 ref (리렌더 없이 빠르게 쌓음)
   * 완료 시 preloadedMedia state로 한 번만 스냅샷
   */
  const preloadedMediaRef = useRef<PreloadedMediaMap>(new Map());
  const [preloadedMedia, setPreloadedMedia] = useState<PreloadedMediaMap>(new Map());
  /** MainIntro exit 애니메이션 완전 종료 여부 */
  const [introFadedOut, setIntroFadedOut] = useState(false);

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
    const introSection = sections.find((s: SectionConfig) => s.type === 'intro');
    const introContent = introSection?.content as Record<string, unknown> | undefined;
    const introVideo: string | undefined =
      (typeof introContent?.introVideo === 'string' ? introContent.introVideo : undefined);

    // --- Collect every URL from the entire wedding config ---
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
    
    // Extract from the whole wedding object (including ogImage, event location images, etc)
    extractUrls(wedding);

    // --- Build task lists with priority ---
    const priorityTasks: Array<() => Promise<void>> = [];
    const regularTasks: Array<() => Promise<void>> = [];

    // 1. Font (Priority)
    priorityTasks.push(
      () =>
        new Promise<void>((resolve) => {
          if (document.fonts) {
            document.fonts.load('16px GowunDodum').then(() => resolve()).catch(() => resolve());
          } else {
            resolve();
          }
        })
    );

    // 2. Intro sequence frames (Priority)
    for (let i = 1; i <= 45; i++) {
      const frameNum = String(i).padStart(4, '0');
      const url = `/test-resources/intro/frame_${frameNum}.webp`;
      priorityTasks.push(
        () => new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        })
      );
    }

    // 3. Intro video (if variant is video) (Priority)
    if (introVideo) {
      priorityTasks.push(
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

    // 4. VideoGreeting2 frames (Regular)
    for (let i = 1; i <= 74; i++) {
      const frameNum = String(i).padStart(4, '0');
      const url = `/test-resources/video/frame_${frameNum}.webp`;
      regularTasks.push(
        () => new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        })
      );
    }

    // 5. All other media from sections (Regular)
    allUrls.forEach(url => {
      // Skip if already in priority
      if (url === introVideo) return;
      if (url.includes('/test-resources/intro')) return;
      if (url.includes('/test-resources/video')) return; // already in regular

      if (url.match(/\.(mp4|webm)$/i)) {
        regularTasks.push(
          () =>
            new Promise<void>((resolve) => {
              const v = document.createElement('video');
              v.muted = true;
              v.playsInline = true;
              v.preload = 'auto';
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
        regularTasks.push(
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
        regularTasks.push(
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

    // --- Run tasks sequentially by batch ---
    const total = priorityTasks.length + regularTasks.length;
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

    // First batch: Priority tasks (Wait for them to start)
    Promise.all(priorityTasks.map(task => task().then(onOneDone).catch(onOneDone))).then(() => {
      // Second batch: Regular tasks (All other media, including gallery)
      regularTasks.forEach(task => task().then(onOneDone).catch(onOneDone));
    });

    // Update state snapshot when ALL are done
    const allTasks = [...priorityTasks, ...regularTasks];
    Promise.all(allTasks.map(t => t())).catch(() => {}).finally(() => {
      setPreloadedMedia(new Map(preloadedMediaRef.current));
    });
  }, [wedding, sections]);



  useEffect(() => {
    if (showIntro && !isPreloading) {
      const introSection = sections.find((s: SectionConfig) => s.type === 'intro');
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

  // 1. Separate 'intro' from other sections
  const introSection = sections.find((s: SectionConfig) => s.type === 'intro');
  const otherSections = sections.filter((s: SectionConfig) => s.type !== 'intro');
  const visibleSections = otherSections.filter((s: SectionConfig) => s.isVisible);
  const lastSectionId = visibleSections[visibleSections.length - 1]?.id;

  // 2. Render Intro Overlay
  const renderIntro = () => {
    if (!introSection) return null;

    const componentMap = SECTION_COMPONENTS[introSection.type];
    const Component = componentMap?.[introSection.variant] || componentMap?.['basic'];
    
    if (!Component) return null;

    return (
      <AnimatePresence onExitComplete={() => setIntroFadedOut(true)}>
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
    <IntroFadedContext.Provider value={introFadedOut}>
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
          />
        )}

        {/* Render Main Content (only after intro) */}
        {!showIntro && (
          <div className="animate-in fade-in duration-1000">
            {otherSections.map((section: SectionConfig, index: number) => {
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
                  <div ref={section.id === 'sec_memories' ? fadeInRef : null}>
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
    </IntroFadedContext.Provider>
  );
}
