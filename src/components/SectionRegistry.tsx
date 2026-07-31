'use client';

import { WeddingConfig, BackgroundConfig, SectionConfig, SectionProps } from '@/types/wedding';
import { ComponentType, useState, useEffect, useMemo, useRef } from 'react';
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

const MEDIA_URL_PATTERN = /\.(jpeg|jpg|gif|png|webp|svg|mp4|webm|mp3|wav)(?:\?.*)?$/i;
const VIDEO_URL_PATTERN = /\.(mp4|webm)(?:\?.*)?$/i;
const AUDIO_URL_PATTERN = /\.(mp3|wav)(?:\?.*)?$/i;
const GALLERY_PRELOAD_COUNT = 4;
const NORMAL_PRELOAD_AHEAD_COUNT = 2;
const FAST_SCROLL_PRELOAD_AHEAD_COUNT = 3;
const MAX_CONCURRENT_MEDIA_PRELOADS = 4;
const PRIORITY_PRELOAD_TIMEOUT_MS = 7000;

function collectMediaUrls(value: unknown, urls: Set<string>) {
  if (!value) return;

  if (typeof value === 'string') {
    if (MEDIA_URL_PATTERN.test(value)) urls.add(value);
    return;
  }

  if (typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach(item => collectMediaUrls(item, urls));
  }
}

function getSectionPreloadUrls(section: SectionConfig): string[] {
  const urls = new Set<string>();
  collectMediaUrls(section.content, urls);

  const content = section.content as Record<string, unknown>;
  if (section.type === 'gallery' && Array.isArray(content.images)) {
    const images = content.images.filter((image): image is string => typeof image === 'string');
    images.forEach(image => urls.delete(image));
    images.slice(0, GALLERY_PRELOAD_COUNT).forEach(image => urls.add(image));
  }

  if (section.type === 'greeting' && section.variant === 'video2') {
    for (let i = 1; i <= 74; i++) {
      const frameNum = String(i).padStart(4, '0');
      urls.add(`/test-resources/video/frame_${frameNum}.webp`);
    }
  }

  return [...urls];
}


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
  const mediaPreloadPromisesRef = useRef<Map<string, Promise<void>>>(new Map());
  const sectionElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const fadeInRef = useRef<HTMLDivElement>(null);
  /** MainIntro exit 애니메이션 완전 종료 여부 */
  const [introFadedOut, setIntroFadedOut] = useState(false);

  const introSection = sections.find((section: SectionConfig) => section.type === 'intro');
  const visibleSections = useMemo(
    () => sections.filter((section: SectionConfig) => section.type !== 'intro' && section.isVisible),
    [sections],
  );
  const lastSectionId = visibleSections[visibleSections.length - 1]?.id;

  // Intro 표시 중일 때 body 스크롤 차단
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showIntro]);

  // Preloading Logic — block only on priority resources; regular media continues in the background.
  useEffect(() => {
    preloadedMediaRef.current.clear();
    mediaPreloadPromisesRef.current.clear();
    setIsPreloading(true);
    setLoadingProgress(0);
    const introContent = introSection?.content as Record<string, unknown> | undefined;
    const introVideo: string | undefined =
      (typeof introContent?.introVideo === 'string' ? introContent.introVideo : undefined);

    // --- Build only the blocking priority task list ---
    const priorityTasks: Array<() => Promise<void>> = [];

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
    if (introSection?.variant === 'video') {
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

    const total = priorityTasks.length;
    if (total === 0) {
      setLoadingProgress(100);
      const timer = setTimeout(() => setIsPreloading(false), 300);
      return () => clearTimeout(timer);
    }

    let cancelled = false;
    let completionTimer: ReturnType<typeof setTimeout> | undefined;
    let completed = 0;
    const onOneDone = () => {
      completed++;
      if (!cancelled) {
        setLoadingProgress(Math.round((completed / total) * 100));
      }
    };

    const runBatch = async (tasks: Array<() => Promise<void>>) => {
      await Promise.all(tasks.map(async task => {
        try {
          await new Promise<void>((resolve) => {
            const timeout = window.setTimeout(resolve, PRIORITY_PRELOAD_TIMEOUT_MS);
            Promise.resolve()
              .then(task)
              .catch(() => undefined)
              .finally(() => {
                window.clearTimeout(timeout);
                resolve();
              });
          });
        } catch {
          // A failed resource should not block the invitation.
        } finally {
          onOneDone();
        }
      }));
    };

    const preload = async () => {
      await runBatch(priorityTasks);

      if (cancelled) return;

      setPreloadedMedia(new Map(preloadedMediaRef.current));

      completionTimer = setTimeout(() => {
        if (!cancelled) setIsPreloading(false);
      }, 300);
    };

    void preload();

    return () => {
      cancelled = true;
      if (completionTimer) clearTimeout(completionTimer);
    };
  }, [wedding, introSection]);

  useEffect(() => {
    if (showIntro || visibleSections.length === 0) return;

    let cancelled = false;
    let animationFrame: number | undefined;
    let previousScrollY = window.scrollY;
    let activePreloads = 0;
    const queuedPreloads = new Map<string, { priority: number; start: () => void }>();

    const runQueuedPreloads = () => {
      while (!cancelled && activePreloads < MAX_CONCURRENT_MEDIA_PRELOADS && queuedPreloads.size > 0) {
        const [nextUrl, nextPreload] = [...queuedPreloads.entries()]
          .sort(([, left], [, right]) => right.priority - left.priority)[0];
        queuedPreloads.delete(nextUrl);
        activePreloads++;
        nextPreload.start();
      }
    };

    const preloadUrl = (url: string, priority: number) => {
      const existing = mediaPreloadPromisesRef.current.get(url);
      if (existing) {
        const queuedPreload = queuedPreloads.get(url);
        if (queuedPreload) {
          queuedPreload.priority = Math.max(queuedPreload.priority, priority);
          runQueuedPreloads();
        }
        return existing;
      }

      const task = new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve();
          activePreloads--;
          runQueuedPreloads();
        };

        queuedPreloads.set(url, {
          priority,
          start: () => {
            if (VIDEO_URL_PATTERN.test(url)) {
              const video = document.createElement('video');
              video.muted = true;
              video.playsInline = true;
              video.preload = 'auto';
              video.oncanplaythrough = () => {
                if (!cancelled) {
                  preloadedMediaRef.current.set(url, video);
                  setPreloadedMedia(new Map(preloadedMediaRef.current));
                }
                finish();
              };
              video.onerror = finish;
              video.src = url;
              video.load();
            } else if (AUDIO_URL_PATTERN.test(url)) {
              const audio = new Audio();
              audio.oncanplaythrough = finish;
              audio.onerror = finish;
              audio.preload = 'auto';
              audio.src = url;
              audio.load();
            } else {
              const image = new window.Image();
              image.onload = finish;
              image.onerror = finish;
              image.src = url;
            }
          },
        });
      });

      mediaPreloadPromisesRef.current.set(url, task);
      runQueuedPreloads();
      return task;
    };

    const preloadSection = (sectionIndex: number, priority: number) => {
      const section = visibleSections[sectionIndex];
      if (!section) return;
      getSectionPreloadUrls(section).forEach(url => {
        void preloadUrl(url, priority);
      });
    };

    const updatePreloadWindow = () => {
      animationFrame = undefined;
      const viewportTarget = window.innerHeight * 0.45;
      let activeIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      visibleSections.forEach((section, index) => {
        const element = sectionElementsRef.current.get(section.id);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        if (rect.top <= viewportTarget && rect.bottom >= viewportTarget) {
          activeIndex = index;
          nearestDistance = 0;
          return;
        }

        if (nearestDistance === 0) return;
        const distance = Math.abs((rect.top + rect.bottom) / 2 - viewportTarget);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          activeIndex = index;
        }
      });

      const scrollDelta = window.scrollY - previousScrollY;
      const direction = scrollDelta >= 0 ? 1 : -1;
      const aheadCount = Math.abs(scrollDelta) > window.innerHeight * 0.5
        ? FAST_SCROLL_PRELOAD_AHEAD_COUNT
        : NORMAL_PRELOAD_AHEAD_COUNT;
      previousScrollY = window.scrollY;

      for (let offset = 0; offset <= aheadCount; offset++) {
        const index = activeIndex + direction * offset;
        if (index >= 0 && index < visibleSections.length) {
          preloadSection(index, aheadCount - offset + 1);
        }
      }
    };

    const schedulePreloadWindowUpdate = () => {
      if (animationFrame !== undefined) return;
      animationFrame = window.requestAnimationFrame(updatePreloadWindow);
    };

    updatePreloadWindow();
    window.addEventListener('scroll', schedulePreloadWindowUpdate, { passive: true });
    window.addEventListener('resize', schedulePreloadWindowUpdate);

    return () => {
      cancelled = true;
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', schedulePreloadWindowUpdate);
      window.removeEventListener('resize', schedulePreloadWindowUpdate);
    };
  }, [showIntro, visibleSections]);

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
            {visibleSections.map((section: SectionConfig, index: number) => {
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
                  <div
                    ref={(element) => {
                      if (element) {
                        sectionElementsRef.current.set(section.id, element);
                      } else {
                        sectionElementsRef.current.delete(section.id);
                      }

                      if (section.id === 'sec_memories') {
                        fadeInRef.current = element;
                      }
                    }}
                  >
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
