import { useRef, useEffect } from 'react';
import { SectionProps } from '@/types/wedding';
import Image from 'next/image';

export default function MainIntro({ config, isVisible, onEnter }: SectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      // Force play for mobile browsers that might block standard autoPlay attributes
      videoRef.current.play().catch((error) => {
        console.warn("Video auto-play failed. This is usually due to browser policy or low power mode:", error);
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;
  
  const { mainImage, introVideo } = config as { mainImage?: string; introVideo?: string; title?: string };

  return (
    <section 
      className="w-full h-[100dvh] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
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
