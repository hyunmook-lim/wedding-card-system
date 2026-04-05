'use client';

import { motion } from 'framer-motion';

interface SolidColorBackgroundProps {
  color: string;
}

export default function SolidColorBackground({ color }: SolidColorBackgroundProps) {
  return (
    <motion.div 
      className="absolute inset-0 z-0 origin-center w-full h-full"
      style={{ backgroundColor: color }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        scale: [1, 1.05, 1],
        x: [0, 5, -5, 0],
        y: [0, -5, 5, 0]
      }}
      exit={{ opacity: 0 }}
      transition={{ 
        opacity: { duration: 0.8 },
        scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 25, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 22, repeat: Infinity, ease: "easeInOut" }
      }}
    />
  );
}
