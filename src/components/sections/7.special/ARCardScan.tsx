'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import { SectionProps } from '@/types/wedding';
import { MindARThree as MindARThreeType } from '@/types/mind-ar';

/* ─────────────────────── AR Card Scan Component (Optimized) ─────────────────────── */

export default function ARCardScan({ config }: SectionProps) {
  const rootRef = useRef<HTMLDivElement>(null); // For Intersection Observer
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mindarRef = useRef<MindARThreeType | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLibraryReady, setIsLibraryReady] = useState(false);
  const [isDetected, setIsDetected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);

  // Get config values
  const targetImage = (config?.targetImage as string) || '/test-resources/ar/target-image.mind';
  const videoUrl = (config?.videoUrl as string) || '/test-resources/ar/test-video.MP4';
  const title = (config?.title as string) || 'AR 초대장';
  const subtitle = (config?.subtitle as string) || '초대장을 카메라에 비춰보세요';

  // Cleanup Function
  const stopAR = useCallback(() => {
    console.log("MindAR: Stopping AR engine...");
    if (mindarRef.current) {
      try {
        mindarRef.current.stop();
        if (mindarRef.current.renderer) {
          mindarRef.current.renderer.setAnimationLoop(null);
          mindarRef.current.renderer.dispose();
        }
      } catch (e) {
        console.warn("MindAR: Cleanup error", e);
      }
      mindarRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current = null;
    }
    setIsDetected(false);
    setStatus('idle');
  }, []);

  // Initialization Function
  const initAR = useCallback(async () => {
    if (!containerRef.current || !isLibraryReady || status === 'active') return;

    try {
      console.log("MindAR: Initializing AR engine...");
      
      const MindARClass = window.MindARThree;
      const MTHREE = window.MindARTHREE;
      
      if (!MindARClass || !MTHREE) throw new Error("AR library not ready");

      const mindarThree = new MindARClass({
        container: containerRef.current,
        imageTargetSrc: targetImage,
        uiLoading: "no",
        uiScanning: "no",
        uiError: "no",
      }) as MindARThreeType;

      const { renderer, scene, camera } = mindarThree;
      mindarRef.current = mindarThree;

      const video = document.createElement('video');
      video.src = videoUrl;
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      video.loop = true;
      video.crossOrigin = "anonymous";
      videoRef.current = video;

      const texture = new MTHREE.VideoTexture(video);
      const geometry = new MTHREE.PlaneGeometry(1.1, 1.1 * 0.75); 
      const material = new MTHREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true,
        side: MTHREE.DoubleSide
      });
      
      const plane = new MTHREE.Mesh(geometry, material);
      const anchor = mindarThree.addAnchor(0);
      anchor.group.add(plane);

      anchor.onTargetFound = () => {
        setIsDetected(true);
        video.currentTime = 0; 
        video.play().catch(e => console.warn("MindAR: Play failed:", e));
      };

      anchor.onTargetLost = () => {
        setIsDetected(false);
        video.pause();
      };

      await mindarThree.start();
      
      renderer.setAnimationLoop(() => {
        if (mindarThree && mindarThree.renderer) {
          renderer.render(scene, camera);
        }
      });

      setStatus('active');

    } catch (err: unknown) {
      console.error("MindAR Error:", err);
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : "카메라를 시작할 수 없습니다.");
    }
  }, [targetImage, videoUrl, isLibraryReady, status]);

  const startAR = useCallback(async () => {
    if (!window.isSecureContext) {
      setStatus('error');
      setErrorMsg('카메라는 HTTPS 환경에서만 사용할 수 있습니다.');
      return;
    }

    setStatus('loading');
    
    // Ensure library is ready
    if (!isLibraryReady) {
      let attempts = 0;
      while (!window.MindARThree && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      if (!window.MindARThree) {
        setStatus('error');
        setErrorMsg('AR 라이브러리를 불러오지 못했습니다.');
        return;
      }
      setIsLibraryReady(true);
    }

    await initAR();
  }, [isLibraryReady, initAR]);

  // Observer Effect: Tracks if the component is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
        console.log("ARCardScan: Visibility Changed ->", entry.isIntersecting);
      },
      { threshold: 0.1 } // 10% visible to trigger
    );

    if (rootRef.current) {
      observer.observe(rootRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Library Bridge Effect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const BRIDGE_ID = 'mindar-bridge';
    const READY_EVENT = 'mindar-ready';
    const onReady = () => setIsLibraryReady(true);

    window.addEventListener(READY_EVENT, onReady);
    if (window.MindARThree && window.MindARTHREE) {
      onReady();
    } else if (!document.getElementById(BRIDGE_ID)) {
      const script = document.createElement('script');
      script.id = BRIDGE_ID;
      script.type = 'module';
      script.textContent = `
        import * as THREE from 'https://esm.sh/three@0.149.0';
        import { MindARThree } from 'https://esm.sh/mind-ar@1.2.5/dist/mindar-image-three.prod.js?deps=three@0.149.0';
        window.MindARTHREE = THREE;
        window.MindARThree = MindARThree;
        window.dispatchEvent(new Event('${READY_EVENT}'));
      `;
      document.head.appendChild(script);
    }

    return () => {
      window.removeEventListener(READY_EVENT, onReady);
      stopAR();
    };
  }, [stopAR]);

  // Engine Control Effect: Reactive to Visibility
  useEffect(() => {
    if (!isInView && status !== 'idle') {
      stopAR();
    }
  }, [isInView, status, stopAR]);

  const handleContainerClick = () => {
    if (videoRef.current && isDetected) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play();
    }
  };

  return (
    <div 
      ref={rootRef}
      className="relative w-full h-full overflow-hidden cursor-pointer transition-colors duration-700"
      style={{ backgroundColor: status === 'idle' ? '#fffdf7' : '#000000' }}
      onClick={handleContainerClick}
    >
      <div ref={containerRef} className="absolute inset-0 w-full h-full mindar-container z-0" />

      {/* ── UI Layer ── */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
        <div className="w-full h-full relative pointer-events-auto flex flex-col items-center justify-center">
          
          {/* ── Idle State: Elegant Start Screen ── */}
          <AnimatePresence>
            {status === 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex flex-col items-center px-8 w-full max-w-[320px]"
              >
                {/* Decorative Divider */}
                <div className="flex items-center space-x-3 mb-8 opacity-20">
                  <div className="w-8 h-[0.5px] bg-black" />
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <div className="w-8 h-[0.5px] bg-black" />
                </div>

                {/* Typography Title */}
                <div className="text-center mb-10">
                  <Typography 
                    className="font-serif text-[1.4rem] tracking-[0.2em] text-black/80 font-medium mb-3 uppercase"
                  >
                    AR 초대장
                  </Typography>
                  <Typography 
                    className="text-[0.6rem] tracking-[0.4em] text-black/40 font-light uppercase"
                  >
                    {title}
                  </Typography>
                </div>

                {/* Subtitle / Description */}
                <div className="mb-12 text-center">
                  <Typography className="text-[0.8rem] text-black/50 leading-relaxed font-light">
                    {subtitle.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </Typography>
                </div>

                {/* Start Button (Premium) */}
                <button
                  onClick={startAR}
                  className="relative w-full py-4 rounded-full text-[0.65rem] tracking-[0.3em] font-bold uppercase transition-all duration-300 active:scale-95 group"
                  style={{
                    background: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    color: 'rgba(0,0,0,0.6)',
                  }}
                >
                  <span className="relative z-10 group-hover:text-black transition-colors">카메라 시작하기</span>
                  <div className="absolute inset-0 rounded-full bg-black/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Loading State ── */}
          <AnimatePresence>
            {status === 'loading' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#fffdf7]/80 backdrop-blur-sm"
              >
                <div className="w-12 h-12 border-2 border-amber-900/5 border-t-amber-500/60 rounded-full animate-spin mb-6" />
                <Typography className="text-[0.6rem] tracking-[0.4em] text-black/40 font-light uppercase">
                  카메라 연결 중...
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Active State: Camera is ON ── */}
          <AnimatePresence>
            {status === 'active' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 w-full h-full pointer-events-none"
              >
                {/* 1. Close Button */}
                <button
                  onClick={stopAR}
                  className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 pointer-events-auto"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* 2. Scanning Overlay UI */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${isDetected ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                  {/* Elegant Scanning Frame */}
                  <div className="relative w-64 h-40 border-[0.5px] border-white/20 rounded-sm">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-[1.5px] border-l-[1.5px] border-amber-400/50 -mt-[0.5px] -ml-[0.5px]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-[1.5px] border-r-[1.5px] border-amber-400/50 -mt-[0.5px] -mr-[0.5px]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[1.5px] border-l-[1.5px] border-amber-400/50 -mb-[0.5px] -ml-[0.5px]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[1.5px] border-r-[1.5px] border-amber-400/50 -mb-[0.5px] -mr-[0.5px]" />
                    
                    {/* Soft Scan Line */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-400/20 to-transparent h-[1.5px] w-full animate-scan-line shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
                  </div>

                  <div className="mt-12 text-center px-10">
                    <Typography 
                      className="font-serif text-[1.1rem] tracking-[0.25em] text-white/90 font-medium mb-3 uppercase"
                    >
                      AR 초대장 스캔
                    </Typography>
                    <Typography className="text-[0.65rem] tracking-[0.3em] text-white/50 font-light uppercase italic">
                      {subtitle}
                    </Typography>
                  </div>
                </div>

                {/* 3. Tracking Feedback */}
                {isDetected && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 z-20"
                  >
                    <div className="px-5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <Typography className="text-white/80 text-[10px] tracking-[0.2em] uppercase font-bold">
                        Target Found
                      </Typography>
                    </div>
                  </motion.div>
                )}

                {/* 4. Controls */}
                {isDetected && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (videoRef.current) {
                        const newMuted = !videoRef.current.muted;
                        videoRef.current.muted = newMuted;
                        setIsMuted(newMuted);
                      }
                    }}
                    className="absolute bottom-10 right-8 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 pointer-events-auto"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <span className="text-white/80 text-xl">{isMuted ? '🔇' : '🔊'}</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error State ── */}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 px-10 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20 mb-6">
                <span className="text-2xl">📷</span>
              </div>
              <p className="text-red-400/80 text-sm font-light mb-8 whitespace-pre-line">{errorMsg}</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  startAR();
                }} 
                className="px-8 py-3 rounded-full border border-amber-400/20 text-amber-400 text-xs uppercase active:scale-95 transition-transform"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan-line { 0% { top: 0; } 100% { top: 100%; } }
        .animate-scan-line { animation: scan-line 3s infinite linear; }
        .mindar-container video, .mindar-container canvas {
          position: absolute !important; top: 0 !important; left: 0 !important;
          width: 100% !important; height: 100% !important; object-fit: cover !important;
        }
        .mindar-container canvas { z-index: 1 !important; }
        .mindar-container video { z-index: 0 !important; }
      `}</style>
    </div>
  );
}
