'use client';

import { SectionProps } from '@/types/wedding';
import { Typography } from '@/components/ui/Typography';
import { motion, useMotionValueEvent, Variants } from 'framer-motion';
import { useRef, useState } from 'react';
import Image from 'next/image';

import { useTitleAnimation } from '@/hooks/useTitleAnimation';

export default function CardBrideGroom({ isVisible }: SectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  
  // 제목 애니메이션 (useTitleAnimation 훅 사용)
  const { animationState: titleState, titleVariants, scrollYProgress } = useTitleAnimation();

  // 카드만의 독립적인 상태
  type CardState = 'hidden' | 'visible' | 'flipped';
  const [cardState, setCardState] = useState<CardState>('hidden');
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.75) {
      setCardState('visible');
    } else if (latest > 0.50) {
      setCardState('flipped');
    } else if (latest > 0.35) {
      setCardState('visible');
    } else {
      setCardState('hidden');
    }
  });

  const cardVariantsA: Variants = {
    hidden: { 
      y: "560px", // 70lvh -> 0.7 * 800
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
      y: "560px", // 70lvh -> 0.7 * 800
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
          animate={titleState}
          variants={titleVariants}
          className="text-center space-y-6 z-10"
          style={{ willChange: "transform, opacity" }}
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
             animate={cardState}
             className="absolute w-[36%] aspect-[3/4] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] bg-transparent will-change-transform"
             style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
           >
             {/* Front Face */}
             <div className="absolute w-full h-full backface-hidden bg-[#fffdf7] rounded-lg overflow-hidden">
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
               className="absolute w-full h-full backface-hidden bg-[#fffdf7] rounded-lg overflow-hidden"
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
             animate={cardState}
             className="absolute w-[36%] aspect-[3/4] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] bg-transparent will-change-transform"
             style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
           >
             {/* Face 1 (Back Image in this context) */}
             <div className="absolute w-full h-full backface-hidden bg-[#fffdf7] rounded-lg overflow-hidden">
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
               className="absolute w-full h-full backface-hidden bg-[#fffdf7] rounded-lg overflow-hidden"
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
