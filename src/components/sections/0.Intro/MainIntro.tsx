import { useRef, useEffect } from 'react';
import { SectionProps } from '@/types/wedding';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainIntro({ config, isVisible, onEnter, isPreloading, loadingProgress }: SectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      const playVideo = async () => {
        try {
          if (videoRef.current) {
            await videoRef.current.play();
          }
        } catch (error) {
          console.warn("Video auto-play failed. Retrying on interaction:", error);
          // Standard fallback: Wait for user interaction
          const handleFirstClick = () => {
            videoRef.current?.play().catch(() => {});
            window.removeEventListener('click', handleFirstClick);
            window.removeEventListener('touchstart', handleFirstClick);
          };
          window.addEventListener('click', handleFirstClick);
          window.addEventListener('touchstart', handleFirstClick);
        }
      };

      playVideo();
    }
  }, [isVisible]);

  if (!isVisible) return null;
  
  const { mainImage, introVideo = '/test-resources/intro.mp4' } = config as { mainImage?: string; introVideo?: string; title?: string };

  return (
    <section 
      className="w-full h-[100lvh] flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-white"
      onClick={onEnter}
    >
        <div className="relative w-full h-full">
            {introVideo ? (
                <video
                    ref={videoRef}
                    src={introVideo}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onLoadedData={() => videoRef.current?.play().catch(() => {})}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : mainImage ? (
                <Image
                    src={mainImage}
                    alt="Main Cover"
                    fill
                    className="object-cover"
                    priority
                />
            ) : null}

            {/* Loading Overlay */}
            <AnimatePresence mode="wait">
                {isPreloading && (
                    <motion.div 
                        key="loading"
                        className="absolute bottom-20 left-0 right-0 flex flex-col items-center justify-center z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="w-48 h-[2px] bg-white/30 rounded-full overflow-hidden"
                        >
                            <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${loadingProgress || 0}%` }}
                                transition={{ ease: "easeOut", duration: 0.3 }}
                            />
                        </motion.div>
                        <div className="mt-4 text-[10px] text-white/80 font-light tracking-[0.2em] drop-shadow-md">
                            초대장을 준비하고 있습니다
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </section>
  );
}
