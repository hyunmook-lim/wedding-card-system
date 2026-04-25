import { useRef, useEffect } from 'react';
import { SectionProps } from '@/types/wedding';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
  
  const { mainImage, introVideo } = config as { mainImage?: string; introVideo?: string; title?: string };

  return (
    <section 
      className="w-full h-[100dvh] flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-black"
      onClick={onEnter}
    >
        <div className="relative w-full h-full">
            {introVideo ? (
                <video
                    ref={videoRef}
                    src={introVideo}
                    autoPlay
                    loop
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
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Wedding Photo
                </div>
            )}

        </div>
    </section>
  );
}
