'use client';

import { motion } from 'framer-motion';

export default function HeartPulseBackground() {
  // 복잡한 인터랙티브 React 컴포넌트 전체를 배경으로 사용하는 예시입니다.
  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center pointer-events-none"
      style={{ backgroundColor: '#1e293b' }} // bg-slate-800 대체 (확실한 배경 확인용)
    >
      <motion.div
        className="relative flex items-center justify-center opacity-80"
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="absolute z-50 text-6xl text-white font-bold drop-shadow-lg">CUSTOM BG!</div>
        {/* CSS로 구현한 단순한 하트 모양 */}
        <div className="relative w-64 h-64 before:absolute before:content-[''] before:left-32 before:top-0 before:w-32 before:h-48 before:bg-red-500 before:rounded-t-full before:-rotate-45 before:origin-[0_100%] after:absolute after:content-[''] after:left-0 after:top-0 after:w-32 after:h-48 after:bg-red-500 after:rounded-t-full after:rotate-45 after:origin-[100%_100%]" />
      </motion.div>
    </div>
  );
}
