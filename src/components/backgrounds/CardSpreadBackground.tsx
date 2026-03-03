'use client';

import { motion, useMotionValueEvent, useScroll, Variants } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';

interface CardData {
  id: number;
  src: string;
  xOffset: number; // -50vw to 50vw
  yOffset: number; // 10vh to 80vh
  rotation: number; // -30deg to 30deg
  delay: number; // 0s to 0.5s
}

export default function CardSpreadBackground() {
  const scrollRef = useStickyScrollRef();
  const containerRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isSpread, setIsSpread] = useState(false);

  // 제한된 그리드 방식으로 무작위 값 생성 (Hydration 에러 방지를 위해 useEffect 내에서 생성)
  useEffect(() => {
    // 카드 1, 2, 3을 각각 5장씩 총 15장 사용
    const cardNumbers = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];
    
    const newCards: CardData[] = cardNumbers.map((num, i) => {
      // 3x5 대략적인 그리드 안에서 위치시키기 위한 계산
      const col = i % 3; // 0 (Left), 1 (Center), 2 (Right)
      const row = Math.floor(i / 3); // 0 (Bottom) ~ 4 (Top)
      
      // 베이스 위치 (화면 좌우 전체에 퍼지도록)
      const baseXOffset = (col - 1) * 32; // -32, 0, 32 (단위: vw)
      // 높이는 5줄 (10vh ~ 90vh 구간)
      const baseYOffset = 10 + row * 20; // 10, 30, 50, 70, 90 (단위: vh)
      
      // 약간의 랜덤성(Jitter)을 부여하여 일렬종대로 서는 것을 방지
      const randomXJitter = (Math.random() - 0.5) * 15;
      const randomYJitter = (Math.random() - 0.5) * 15;

      return {
        id: i,
        src: `/test-resources/bride-groom/card${num}.png`,
        xOffset: baseXOffset + randomXJitter, 
        yOffset: baseYOffset + randomYJitter,
        rotation: (Math.random() - 0.5) * 50, // -25deg ~ 25deg
        delay: Math.random() * 0.4, // 0 ~ 0.4s 딜레이
      };
    });
    // Hydration 오류를 피하기 위해 Client Mount 이후에 랜덤값을 세팅합니다.
    // eslint-disable-next-line
    setCards(newCards);
  }, []);

  const { scrollYProgress } = useScroll({
    target: scrollRef || containerRef,
    offset: ['start end', 'end start']
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.20) {
      if (!isSpread) setIsSpread(true);
    } else {
      if (isSpread) setIsSpread(false);
    }
  });

  if (cards.length === 0) return null;

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
    >
      {/* 어두운 오버레이가 필요하다면 여기에 추가 */}
      <div className="absolute inset-0 bg-black/5" />

      {cards.map((card) => {
        const variants: Variants = {
          hidden: { 
            y: "110vh", // 화면 맨 아래 바깥쪽 (숨김)
            x: "0vw",
            rotate: 0,
            opacity: 0,
          },
          spread: {
            y: `-${card.yOffset}vh`, // 음수 값이어야 위로 올라옵니다! (중요)
            x: `${card.xOffset}vw`,
            rotate: card.rotation,
            opacity: 1, 
            transition: { 
              type: "spring",
              stiffness: 70,
              damping: 15,
              delay: card.delay,
              mass: 0.8
            }
          }
        };

        return (
          <motion.div
            key={card.id}
            variants={variants}
            initial="hidden"
            animate={isSpread ? "spread" : "hidden"}
            // 크기를 이전(w-[30%])의 약 1/4 면적이 되도록 w-[15%]로 줄였습니다.
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[15%] aspect-[3/4] origin-bottom shadow-lg rounded-md overflow-hidden"
            style={{ 
              willChange: "transform, opacity",
            }}
          >
            {/* 이미지가 비율이 깨지더라도 꽉 차게 보이도록 object-cover 대신 100% width/height 강제 적용 */}
            <Image
              src={card.src}
              alt={`Background Card ${card.id}`}
              fill
              style={{ objectFit: 'fill' }} // 이미지를 억지로 늘려서 꽉 채움
              sizes="(max-width: 768px) 15vw, 10vw"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
