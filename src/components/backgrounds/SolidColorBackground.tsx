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
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    />
  );
}
