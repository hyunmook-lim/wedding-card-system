'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { SectionProps } from '@/types/wedding';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/Typography';

export default function VideoGreeting({ config, isVisible }: SectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Extract config
  const images = useMemo(() => (config.images as string[]) || [], [config.images]);
  const title = (config.title as string) || '';
  const message = (config.message as string) || '';
  
  // Height multiplier for scroll distance

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Exit phase: When the sticky container scrolls out of view (after 'end end')
  const { scrollYProgress: scrollYExit } = useScroll({
    target: containerRef,
    offset: ['end end', 'end start'],
  });

  // Title stays visible during the main scroll, fades out with container at the end
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 1]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Effects trigger only during the exit phase
  const containerOpacity = useTransform(scrollYExit, [0, 1], [1, 0]);
  const containerBlur = useTransform(scrollYExit, [0, 1], ["blur(0px)", "blur(10px)"]);

  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  // Preload images
  useEffect(() => {
    if (!images || images.length === 0) {
      setIsLoading(false);
      return;
    }

    let loadedCount = 0;
    const imgElements: HTMLImageElement[] = [];

    // Begin loading
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setIsLoading(false);
        }
      };
      // If error, we still count it or handle it? Simple approach for now.
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === images.length) setIsLoading(false);
      }
      imgElements.push(img);
    });

    setLoadedImages(imgElements);
  }, [images]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadedImages.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (index: number) => {
      const img = loadedImages[index];
      if (!img) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      if (canvasWidth === 0 || canvasHeight === 0) return;

      // Use object-fit: contain logic to ensure the whole image is visible
      const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
      
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;
      
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Initial render attempt
    render(0);

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // Play video across the full sticky duration (0 -> 1)
      const playbackProgress = latest;
      
      const index = Math.min(
        Math.floor(playbackProgress * (loadedImages.length - 1)),
        loadedImages.length - 1
      );
      requestAnimationFrame(() => render(index));
    });

    return () => unsubscribe();
  }, [loadedImages, scrollYProgress]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.current.height = window.innerHeight * window.devicePixelRatio;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
    }, []);

  if (!isVisible) return null;

  return (
    <div ref={containerRef} className={cn("relative w-full h-full")}>
      <motion.div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden bg-black"
        style={{ 
          opacity: containerOpacity,
          filter: containerBlur,
        }}
      >
        {images.length > 0 ? (
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover"
          />
        ) : (
           <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
             <p>[VideoGreeting] 설정된 이미지가 없습니다.</p>
           </div>
        )}

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <motion.div 
            style={{ opacity: titleOpacity }}
            className="text-center text-white px-6"
          >
            {title && <Typography variant="overlay-title">{title}</Typography>}
            {message && <Typography variant="overlay-body">{message}</Typography>}
          </motion.div>
        </div>
        
        {/* Scroll Hint */}
        <motion.div 
            style={{ opacity: scrollHintOpacity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-sm animate-bounce"
        >
            Scroll Down
        </motion.div>
      </motion.div>
    </div>
  );
}
