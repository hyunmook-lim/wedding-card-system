'use client';

import { useState, useRef, useEffect } from 'react';
import { LiquidGlassWidget } from '@/components/ui/LiquidGlassWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { getWedding } from '@/lib/fetch-wedding';
import { WeddingConfig } from '@/types/wedding';

export default function BGMPlayer({ weddingId }: { weddingId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [weddingData, setWeddingData] = useState<WeddingConfig | null>(null);
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

  const handleShare = () => {
    if (!window.Kakao) {
      alert('카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    if (!weddingData) return;

    const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/${weddingId}` : '';
    
    // Set requested image
    const imageUrl = `${window.location.origin}/test-resources/openimage.jpeg`;

    // Format date and time (e.g. 2026.07.25 11:00)
    const dateObj = new Date(weddingData.event.date);
    const formattedDate = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;
    const formattedTime = dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `${weddingData.couple.groom.name} & ${weddingData.couple.bride.name}의 결혼식`,
        description: `${weddingData.event.location.name}\n${formattedDate} ${formattedTime}`,
        imageUrl: imageUrl,
        link: {
          mobileWebUrl: currentUrl,
          webUrl: currentUrl,
        },
      },
      buttons: [
        {
          title: '청첩장 보기',
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
      ],
    });
  };

  useEffect(() => {
    // Fetch wedding data for share card
    getWedding(weddingId).then(data => {
      setWeddingData(data);
    });

    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.4;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [weddingId]);

  return (
    <div className="fixed top-5 right-5 z-[100] md:right-[calc(50%-215px+20px)] flex flex-col gap-3">
      <audio
        ref={audioRef}
        src="/test-resources/bgm.mp3"
        loop
        preload="auto"
      />
      
      {/* BGM Toggle Button */}
      <LiquidGlassWidget
        variant="dock"
        onClick={toggleBGM}
        className="w-10 h-10 flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-transform"
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

      {/* Kakao Share Floating Button */}
      <LiquidGlassWidget
        variant="dock"
        onClick={handleShare}
        className="w-10 h-10 flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-transform bg-[#FEE500]/10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#3C1E1E]">
          <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.712 4.8 4.32 6.098l-.81 2.952c-.094.338.1.682.438.772.116.031.245.02.351-.03l3.35-2.233c.43.048.87.073 1.31.073 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
        </svg>
      </LiquidGlassWidget>
    </div>
  );
}
