'use client';

import { useState, useRef, useEffect } from 'react';
import { LiquidGlassWidget } from '@/components/ui/LiquidGlassWidget';
import { motion, AnimatePresence } from 'framer-motion';

export default function BGMPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleBGM = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("BGM playback failed:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.4;
      // Many browsers block autoplay unless user interacts. 
      // We attempt to play, but fallback to paused state if blocked.
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  return (
    <div className="fixed top-5 right-5 z-[100] md:right-[calc(50%-215px+20px)]">
      <audio
        ref={audioRef}
        src="/test-resources/bgm.mp3"
        loop
        preload="auto"
      />
      
      <LiquidGlassWidget
        variant="dock"
        onClick={toggleBGM}
        className="w-10 h-10 flex items-center justify-center cursor-pointer shadow-sm active:scale-90 transition-transform"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-end justify-center gap-[2.5px] h-3"
              >
                <motion.div
                  animate={{ height: [4, 12, 6, 10, 4] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-[2px] bg-black/60 rounded-full"
                />
                <motion.div
                  animate={{ height: [8, 4, 12, 6, 8] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                  className="w-[2px] bg-black/60 rounded-full"
                />
                <motion.div
                  animate={{ height: [12, 6, 10, 4, 12] }}
                  transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }}
                  className="w-[2px] bg-black/60 rounded-full"
                />
              </motion.div>
            ) : (
              <motion.div
                key="paused"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-end justify-center gap-[2.5px] h-3"
              >
                <div className="w-[2px] h-[3px] bg-black/30 rounded-full" />
                <div className="w-[2px] h-[3px] bg-black/30 rounded-full" />
                <div className="w-[2px] h-[3px] bg-black/30 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LiquidGlassWidget>
    </div>
  );
}
