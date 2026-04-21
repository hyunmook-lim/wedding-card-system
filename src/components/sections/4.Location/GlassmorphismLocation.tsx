'use client';

import { SectionProps } from '@/types/wedding';
import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll, Variants } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import Image from 'next/image';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { LiquidGlassWidget } from '@/components/ui/LiquidGlassWidget';

export default function GlassmorphismLocation({ isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const { scrollYProgress: inViewProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'start start']
  });
  
  const [showTitle, setShowTitle] = useState(false);
  const [revealed, setRevealed] = useState({
    map: false,
    trans0: false,
    trans1: false,
    trans2: false,
    buttons: false
  });
  
  useMotionValueEvent(inViewProgress, "change", (latest) => {
    setShowTitle(latest > 0.15);
    setRevealed({
      map: latest > 0.3,
      trans0: latest > 0.5,
      trans1: latest > 0.6,
      trans2: latest > 0.7,
      buttons: latest > 0.85
    });
  });

  const transportation = [ 
    { title: "지하철", content: "학동역 10번 출구", icon: "/test-resources/location/subway.svg" },
    { title: "셔틀버스", content: "학동역 10번 출구 좌측에서 셔틀 대기", sub: "(10~15분 간격으로 탑승 가능 하시며,\n3분 정도 소요 됩니다.)", icon: "/test-resources/location/bus.svg" },
    { title: "자가용", content: "네비게이션 '토브헤세드' 검색", sub: "(주차 3시간 무료)\n만차 시 인근주차장 정보\n- 언주로147길 노상공영주차장(4,800원)\n- 연승빌딩주차장(3,000원)", icon: "/test-resources/location/car.svg" }
  ];

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.215, 0.61, 0.355, 1.0] 
      }
    }
  };

  if (!isVisible) return null;

  return (
    <section ref={scrollRef} className="relative w-full min-h-[100svh] flex flex-col items-center justify-center py-20 overflow-hidden">

      {/* Header Title Layer */}
      <motion.div
         initial={{ opacity: 0, y: 50 }}
         animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 50 }}
         transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
         style={{ scale: 0.65, transformOrigin: "top center" }}
         className="w-full flex flex-col items-center z-30 pointer-events-none mb-10 shrink-0"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-3 mb-4 opacity-30">
            <div className="w-8 h-[0.5px] bg-black" />
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-black/80">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <div className="w-8 h-[0.5px] bg-black" />
          </div>
          <Typography className="font-serif text-[1.6rem] tracking-[0.15em] text-black/80 font-medium">오시는 길</Typography>
          <Typography className="text-[0.6rem] tracking-[0.4em] text-black/40 mt-3 font-light uppercase opacity-80">Location Details</Typography>
        </div>
      </motion.div>

      <div className="w-full max-w-[400px] px-8 flex flex-col items-center justify-center z-10 gap-10 shrink-0">
        {/* Map Image Section */}
        <motion.div
          initial="hidden"
          animate={revealed.map ? "visible" : "hidden"}
          variants={fadeInUp}
          className="w-[85%] max-w-[320px] shrink-0"
        >
          <LiquidGlassWidget 
            className="p-2.5 rounded-2xl w-full"
            scrollProgress={inViewProgress}
          >
            <div className="relative w-full overflow-hidden rounded-xl bg-transparent opacity-80 transition-opacity hover:opacity-100">
              <Image 
                src="/test-resources/location/wedding-hall.png" 
                alt="Map" 
                width={500}
                height={312}
                className="w-full h-auto object-cover" 
              />
            </div>
          </LiquidGlassWidget>
        </motion.div>

        {/* Transportation Info Section */}
        <div className="w-full flex flex-col items-center justify-center space-y-6">
          {transportation.map((info, idx) => {
            const isItemRevealed = (revealed as Record<string, boolean>)[`trans${idx}`];
            return (
              <div key={info.title} className="flex items-center space-x-6 w-full">
                <motion.div
                  initial="hidden"
                  animate={isItemRevealed ? "visible" : "hidden"}
                  variants={fadeInUp}
                >
                  <LiquidGlassWidget 
                    className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                    scrollProgress={inViewProgress}
                  >
                    <Image src={info.icon} alt={info.title} width={24} height={24} className="opacity-40" />
                  </LiquidGlassWidget>
                </motion.div>

                <motion.div 
                  initial="hidden"
                  animate={isItemRevealed ? "visible" : "hidden"}
                  variants={fadeInUp}
                  className="flex flex-col min-w-0"
                >
                  <Typography className="text-[0.7rem] font-extrabold text-black/20 uppercase tracking-[0.2em] mb-1">
                    {info.title}
                  </Typography>
                  <Typography variant="body" className="text-[0.95rem] text-black/80 font-semibold leading-tight whitespace-nowrap">
                    {info.content}
                  </Typography>
                  {info.sub && (
                    <Typography className="text-[0.7rem] text-black/40 mt-1 font-light tracking-wide italic whitespace-pre-line">
                      {info.sub}
                    </Typography>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Minimized Navigation Buttons */}
        <div className="flex flex-col items-center gap-6 w-full">
          <motion.div 
            initial="hidden"
            animate={revealed.buttons ? "visible" : "hidden"}
            variants={fadeInUp}
            className="w-full flex justify-center gap-4 mt-2"
          >
            <LiquidGlassWidget 
              variant="dock"
              className="px-5 py-2.5 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
              containerClassName="gap-3"
              scrollProgress={inViewProgress}
              onClick={() => window.open('https://kko.to/Yg1DMuL-SL')}
            >
               <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-[#FEE500] drop-shadow-sm">
                 <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.712 4.8 4.32 6.098l-.81 2.952c-.094.338.1.682.438.772.116.031.245.02.351-.03l3.35-2.233c.43.048.87.073 1.31.073 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
               </svg>
               <span className="text-[0.7rem] font-black text-black/40 tracking-[0.1em] uppercase">Kakao</span>
            </LiquidGlassWidget>

            <LiquidGlassWidget 
              variant="dock"
              className="px-5 py-2.5 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
              containerClassName="gap-3"
              scrollProgress={inViewProgress}
              onClick={() => window.open('https://naver.me/53lKcqqR')}
            >
               <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#03C75A] drop-shadow-sm">
                 <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
               </svg>
               <span className="text-[0.7rem] font-black text-black/40 tracking-[0.1em] uppercase">Naver</span>
            </LiquidGlassWidget>
          </motion.div>

          {/* Hospitality Message */}
          <motion.div
            initial="hidden"
            animate={revealed.buttons ? "visible" : "hidden"}
            variants={fadeInUp}
            className="flex flex-col items-center w-full text-center mt-4"
          >
            <div className="w-6 h-[0.5px] bg-black/10 mb-6" />
            <Typography className="text-[0.9rem] font-serif italic text-black/50 leading-relaxed">
              시원한 <span className="relative inline-block">
                <motion.span 
                  initial={{ scaleX: 0 }}
                  animate={revealed.buttons ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                  className="absolute bottom-0.5 left-0 w-full h-[6px] bg-[#722f37]/20 -z-10" 
                />
                와인 서비스
              </span>도 준비되어 있으니<br/>
              가급적 대중교통을 이용하셔서<br/>
              여유로운 시간을 즐겨주시길 부탁드립니다.
            </Typography>
            <div className="w-1.5 h-1.5 rounded-full bg-black/5 mt-6" />
          </motion.div>

          {/* Cafe Section */}
          <div className="flex flex-col items-center w-full mt-12 pb-10">
            {/* Styled Cafe Header */}
            <motion.div
              initial="hidden"
              animate={inViewProgress.get() > 0.95 ? "visible" : "hidden"}
              variants={fadeInUp}
              style={{ scale: 0.65, transformOrigin: "center" }}
              className="w-full flex flex-col items-center z-30 pointer-events-none mb-6 shrink-0"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center space-x-3 mb-4 opacity-30">
                  <div className="w-8 h-[0.5px] bg-black" />
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-black/80">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <div className="w-8 h-[0.5px] bg-black" />
                </div>
                <Typography className="font-serif text-[1.6rem] tracking-[0.15em] text-black/80 font-medium">주변 카페 안내</Typography>
                <Typography className="text-[0.6rem] tracking-[0.4em] text-black/40 mt-3 font-light uppercase opacity-80">Nearby Cafe Guide</Typography>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate={inViewProgress.get() > 0.95 ? "visible" : "hidden"}
              variants={fadeInUp}
              className="flex flex-col items-center"
            >
              <Typography className="text-[0.9rem] font-serif italic text-black/50 leading-relaxed mb-8 text-center">
                더운 햇살이 내리쬐는 여름 날<br/>
                소중한 시간을 내어 와주신 하객분들을 위해<br/>
                식장 근처 <span className="relative inline-block">
                  <motion.span 
                    initial={{ scaleX: 0 }}
                    animate={inViewProgress.get() > 0.95 ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                    className="absolute bottom-0.5 left-0 w-full h-[6px] bg-[#6F4E37]/15 -z-10" 
                  />
                  예쁘고 맛있는 카페들
                </span>을 공유합니다.
              </Typography>
            </motion.div>

            <LiquidGlassWidget 
              variant="dock"
              className="px-8 py-3.5 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
              scrollProgress={inViewProgress}
              onClick={() => window.open('https://naver.me/5If4L6J7')}
            >
               <span className="text-[0.8rem] font-black text-black/50 tracking-[0.1em] uppercase">
                 ☕ 카페 지도
               </span>
            </LiquidGlassWidget>
          </div>
        </div>
      </div>
    </section>
  );
}
