'use client';

import { SectionProps } from '@/types/wedding';
import { Typography } from '@/components/ui/Typography';
import { motion, useScroll, useMotionValueEvent, Variants } from 'framer-motion';
import { useRef, useState } from 'react';
import Image from 'next/image';

export default function CardBrideGroom({ isVisible }: SectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [animationState, setAnimationState] = useState<'hidden' | 'visible' | 'top' | 'flipped'>('hidden');
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.50) {
      setAnimationState('flipped');
    } else if (latest > 0.35) {
      setAnimationState('top');
    } else if (latest > 0.25) {
      setAnimationState('visible');
    } else {
      setAnimationState('hidden');
    }
  });

  const variants: Variants = {
    hidden: { 
      y: "60vh",
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 1.0,
        ease: "easeInOut"
      }
    },
    visible: { 
      y: 0,
      opacity: 1, 
      scale: 1.3,
      transition: {
        duration: 1.0,
        ease: "easeInOut"
      }
    },
    top: {
      y: "-40vh",
      opacity: 1,
      scale: 0.7,
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    },
    flipped: {
      y: "-40vh",
      opacity: 1,
      scale: 0.7,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const cardVariantsA: Variants = {
    hidden: { 
      y: "70vh", 
      rotate: 0, 
      rotateY: 0,
      transition: { duration: 1, ease: "easeInOut" }
    },
    visible: { 
      y: 0,
      x: "-18vw", 
      rotate: -6, 
      rotateY: 0,
      transition: { duration: 1, ease: "easeInOut" }
    },
    flipped: {
      y: 0,
      x: "-22vw",
      rotate: 0,
      rotateY: -180,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const cardVariantsB: Variants = {
    hidden: { 
      y: "70vh", 
      rotate: 0, 
      rotateY: 180,
      transition: { duration: 1, ease: "easeInOut" }
    },
    visible: { 
      y: 0,
      x: "18vw", 
      rotate: 6, 
      rotateY: 180,
      transition: { duration: 1, ease: "easeInOut" }
    },
    flipped: {
      y: 0,
      x: "22vw",
      rotate: 0,
      rotateY: 0,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  if (!isVisible) return null;

  return (
    <section ref={containerRef} className="relative w-full h-full">
      <div className="absolute top-0 h-full w-full flex flex-col items-center justify-center overflow-hidden perspective-[1000px]">
        <motion.div 
          initial="hidden"
          animate={animationState === 'flipped' ? 'flipped' : animationState}
          variants={variants}
          className="text-center space-y-6 z-10"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
              <Typography variant="display">
                신랑 & 신부
              </Typography>
          </div>
        </motion.div>

        {/* Cards Container */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-0">
           {/* Card A (Left) */}
           <motion.div
             variants={cardVariantsA}
             initial="hidden"
             animate={animationState === 'top' || animationState === 'flipped' ? (animationState === 'flipped' ? "flipped" : "visible") : "hidden"}
             className="absolute w-[36%] aspect-[3/4] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] bg-transparent will-change-transform"
             style={{ transformStyle: 'preserve-3d' }}
           >
             {/* Front Face */}
             <div className="absolute w-full h-full backface-hidden bg-white rounded-lg overflow-hidden">
                <Image 
                  src="/test-resources/bride-groom/front1.png" 
                  alt="Groom Front" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
             </div>
             {/* Back Face */}
             <div 
               className="absolute w-full h-full backface-hidden bg-white rounded-lg overflow-hidden"
               style={{ transform: 'rotateY(180deg)' }}
             >
                <Image 
                  src="/test-resources/bride-groom/back1.png" 
                  alt="Groom Back" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
             </div>
           </motion.div>

           {/* Card B (Right) */}
           <motion.div
             variants={cardVariantsB}
             initial="hidden"
             animate={animationState === 'top' || animationState === 'flipped' ? (animationState === 'flipped' ? "flipped" : "visible") : "hidden"}
             className="absolute w-[36%] aspect-[3/4] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] bg-transparent will-change-transform"
             style={{ transformStyle: 'preserve-3d' }}
           >
             {/* Face 1 (Back Image in this context) */}
             <div className="absolute w-full h-full backface-hidden bg-white rounded-lg overflow-hidden">
                <Image 
                  src="/test-resources/bride-groom/back2.png" 
                  alt="Bride Back" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
             </div>
             {/* Face 2 (Front Image in this context) */}
             <div 
               className="absolute w-full h-full backface-hidden bg-white rounded-lg overflow-hidden"
               style={{ transform: 'rotateY(180deg)' }}
             >
                <Image 
                  src="/test-resources/bride-groom/front2.png" 
                  alt="Bride Front" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
             </div>
           </motion.div>
        </div>
      </div>
    </section>
  );
}
