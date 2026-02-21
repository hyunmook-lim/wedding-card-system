'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  size: number;
  startX: number;
  delay: number;
  duration: number;
  opacity: number;
  sway1: number;
  sway2: number;
}

interface SnowEffectProps {
  particleCount?: number;
}

export default function SnowEffect({ particleCount = 30 }: SnowEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // 파티클 초기 위치/속성 난수 생성 (Hydration 에러 및 Impure Function 렌더링 에러 방지)
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2px ~ 6px
      startX: Math.random() * 100, // 0% ~ 100%
      delay: Math.random() * -10, // -10s ~ 0s 
      duration: Math.random() * 5 + 5, // 5s ~ 10s
      opacity: Math.random() * 0.5 + 0.3, // 0.3 ~ 0.8
      sway1: Math.random() * 20 - 10, // -10 ~ 10 
      sway2: Math.random() * -20 + 10, // 10 ~ -10 
    }));
    
    setParticles(newParticles);
    setMounted(true);
  }, [particleCount]);

  if (!mounted || particles.length === 0) return null;

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-[1] pointer-events-none overflow-hidden"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-[-10px] bg-white rounded-full pointer-events-none blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.startX}%`,
            opacity: p.opacity,
          }}
          initial={{ y: -10, x: 0 }}
          animate={{
            y: ['0vh', '110vh'], // 위에서 아래로
            x: [0, p.sway1, p.sway2, 0], // 좌우로 흔들리며 떨어짐
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity, // 무한 반복
            ease: "linear",
            delay: p.delay, // 마운트 시점에서 바로 떨어지고 있는 것처럼 보이게 음수값
          }}
        />
      ))}
    </div>
  );
}
