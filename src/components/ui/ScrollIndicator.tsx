'use client';

import { motion } from 'framer-motion';

interface ScrollIndicatorProps {
  color?: string;
  text?: string;
}

export function ScrollIndicator({ color = 'rgba(255, 255, 255, 0.8)', text = 'Scroll' }: ScrollIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center cursor-pointer drop-shadow-md">
      <div className="flex flex-col items-center gap-2">
        <motion.div
          animate={{
            y: ["0rem", "1rem", "-1rem", "0rem"],
            opacity: [1, 0, 0, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.35, 0.7, 1]
          }}
          className="w-8 h-8 flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0 0h24v24H0z" fill="none"></path>
            <path 
              d="M11.9997 13.1716L7.04996 8.22186L5.63574 9.63607L11.9997 16L18.3637 9.63607L16.9495 8.22186L11.9997 13.1716Z" 
              fill={color}
            ></path>
          </svg>
        </motion.div>
        
        <span 
          className="text-[0.85rem] uppercase tracking-widest font-serif italic font-bold"
          style={{ color }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}
