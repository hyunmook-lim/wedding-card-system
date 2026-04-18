'use client';

import { useRef, useMemo, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Center, Float, Environment } from '@react-three/drei';
import { SectionProps } from '@/types/wedding';
import * as THREE from 'three';

/* ─────────────────────── 3D Sub-Components ─────────────────────── */

function WeddingRing({ position, rotation, color = '#ffd700' }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2 + (rotation?.[0] ?? 0);
    ref.current.rotation.y += 0.008;
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation} castShadow>
      <torusGeometry args={[0.5, 0.12, 32, 64]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.95}
        roughness={0.08}
        clearcoat={1}
        clearcoatRoughness={0.05}
        envMapIntensity={2}
      />
    </mesh>
  );
}

function FloatingHeart({ position, scale = 1, delay = 0 }: {
  position: [number, number, number];
  scale?: number;
  delay?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.1, y, x, y);
    shape.bezierCurveTo(x - 0.15, y, x - 0.15, y + 0.175, x - 0.15, y + 0.175);
    shape.bezierCurveTo(x - 0.15, y + 0.275, x - 0.05, y + 0.385, x + 0.25, y + 0.5);
    shape.bezierCurveTo(x + 0.55, y + 0.385, x + 0.65, y + 0.275, x + 0.65, y + 0.175);
    shape.bezierCurveTo(x + 0.65, y + 0.175, x + 0.65, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
    return shape;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + delay;
    ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.3;
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.5;
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.1;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh rotation={[Math.PI, 0, 0]} castShadow>
        <extrudeGeometry args={[heartShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 5 }]} />
        <meshPhysicalMaterial
          color="#ff6b8a"
          metalness={0.3}
          roughness={0.2}
          clearcoat={0.8}
          transmission={0.2}
          thickness={0.5}
        />
      </mesh>
    </group>
  );
}

function GoldenSparkles() {
  const ref = useRef<THREE.Points>(null);
  const count = 80;

  const positions = useMemo(() => {
    const seed = (s: number) => {
      return () => {
        s |= 0; s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    };
    const rand = seed(42);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 6;
      pos[i * 3 + 1] = (rand() - 0.5) * 6;
      pos[i * 3 + 2] = (rand() - 0.5) * 6;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ffd700"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function WeddingScene({ groomName, brideName }: { groomName?: string; brideName?: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <group position={[0, 0.5, 0]}>
          <WeddingRing position={[-0.3, 0, 0]} rotation={[0.3, 0, 0.2]} color="#ffd700" />
          <WeddingRing position={[0.3, 0, 0]} rotation={[-0.3, 0, -0.2]} color="#e8c547" />
        </group>
      </Float>

      <FloatingHeart position={[-1.5, 1.2, -0.5]} scale={0.5} delay={0} />
      <FloatingHeart position={[1.8, 0.8, -1]} scale={0.35} delay={1.5} />
      <FloatingHeart position={[-0.8, -0.5, 0.5]} scale={0.25} delay={3} />
      <FloatingHeart position={[1.2, -0.8, -0.3]} scale={0.4} delay={2.2} />

      <GoldenSparkles />

      {groomName && brideName && (
        <Center position={[0, -1.3, 0]}>
          <Text
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.012}
            outlineColor="rgba(0,0,0,0.3)"
          >
            {`${groomName}  ♥  ${brideName}`}
          </Text>
        </Center>
      )}
    </group>
  );
}

/* ─────────────────────── Camera Hook ─────────────────────── */

function useCameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'error' | 'fallback'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const startCamera = useCallback(async () => {
    // 1) Secure context 체크 (HTTPS or localhost)
    if (!window.isSecureContext) {
      setStatus('fallback');
      setErrorMsg('카메라는 HTTPS 환경에서만 사용할 수 있습니다.\nlocalhost 또는 HTTPS로 접속해주세요.');
      return;
    }

    // 2) mediaDevices API 존재 체크
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('fallback');
      setErrorMsg('이 브라우저에서는 카메라를 지원하지 않습니다.');
      return;
    }

    setStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('active');
    } catch (err: unknown) {
      console.error('Camera access failed:', err);
      
      const domErr = err instanceof DOMException ? err : null;
      const errName = domErr?.name || 'Unknown';
      const errMessage = domErr?.message || String(err);
      
      if (errName === 'NotAllowedError') {
        setStatus('error');
        setErrorMsg('카메라 접근이 거부되었습니다.\n브라우저 설정에서 카메라 권한을 허용해주세요.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setStatus('fallback');
        setErrorMsg('카메라를 찾을 수 없습니다.\n3D 뷰어로 전환합니다.');
      } else if (errName === 'NotReadableError' || errName === 'AbortError') {
        setStatus('fallback');
        setErrorMsg('카메라가 다른 앱에서 사용 중입니다.\n3D 뷰어로 전환합니다.');
      } else {
        setStatus('fallback');
        setErrorMsg(`카메라 오류: ${errName}\n${errMessage}`);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStatus('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { videoRef, status, errorMsg, startCamera, stopCamera };
}

/* ─────────────────────── Main ARViewer Component ─────────────────────── */

export default function ARViewer({ config }: SectionProps) {
  const groomName = (config?.groomName as string) || '';
  const brideName = (config?.brideName as string) || '';
  const title = (config?.title as string) || 'AR Experience';
  const subtitle = (config?.subtitle as string) || '터치하여 AR 체험하기';

  const { videoRef, status, errorMsg, startCamera, stopCamera } = useCameraStream();

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* ── Camera Video Feed (background) ── */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: status === 'active' ? 'block' : 'none' }}
      />

      {/* ── 3D Canvas (transparent overlay on camera) ── */}
      {status === 'active' && (
        <div className="absolute inset-0 z-10">
          <Suspense fallback={null}>
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              dpr={[1, 2]}
              gl={{
                antialias: true,
                alpha: true, // ← 투명 배경으로 카메라 피드가 보임
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.2,
              }}
              style={{ touchAction: 'pan-y', background: 'transparent' }}
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
              <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#fff5e6" />
              <pointLight position={[0, 3, 0]} intensity={0.6} color="#ffd700" />

              <WeddingScene groomName={groomName} brideName={brideName} />
              <Environment preset="studio" />
            </Canvas>
          </Suspense>
        </div>
      )}

      {/* ── UI Layer ── */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
        <div className="w-full h-full relative pointer-events-auto flex flex-col items-center justify-center">

      {/* ── Idle State: Start Button ── */}
      {status === 'idle' && (
        <div className="relative z-10 flex flex-col items-center gap-6 px-8">
          {/* Background gradient for idle state */}
          <div
            className="absolute inset-0 -m-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 70%)',
            }}
          />

          {/* Icon */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))',
              border: '1px solid rgba(255,215,0,0.2)',
              boxShadow: '0 0 40px rgba(255,215,0,0.1)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,67,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>

          {/* Title */}
          <div className="relative text-center">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-2"
              style={{ color: 'rgba(212,168,67,0.6)' }}
            >
              {title}
            </p>
            <p
              className="text-sm mb-6"
              style={{ color: 'rgba(212,168,67,0.8)' }}
            >
              {subtitle}
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={startCamera}
            className="relative px-8 py-3.5 rounded-full text-sm tracking-widest uppercase transition-all duration-300 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(212,168,67,0.15))',
              border: '1px solid rgba(255,215,0,0.3)',
              color: 'rgba(212,168,67,0.9)',
              boxShadow: '0 4px 20px rgba(255,215,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            카메라 시작
          </button>
        </div>
      )}

      {/* ── Loading State ── */}
      {status === 'loading' && (
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-amber-400/70 text-xs tracking-widest uppercase">카메라 연결 중...</p>
        </div>
      )}

      {/* ── Error State (permission denied - can retry) ── */}
      {status === 'error' && (
        <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20">
            <span className="text-2xl">📷</span>
          </div>
          <p className="text-red-400/80 text-sm whitespace-pre-line">{errorMsg}</p>
          <button
            onClick={startCamera}
            className="px-6 py-2.5 rounded-full text-xs tracking-widest uppercase border border-amber-400/30 text-amber-400/80 active:scale-95 transition-transform"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* ── Fallback State: 3D scene without camera ── */}
      {status === 'fallback' && (
        <>
          <div className="absolute inset-0">
            <Suspense fallback={null}>
              <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 2]}
                gl={{
                  antialias: true,
                  toneMapping: THREE.ACESFilmicToneMapping,
                  toneMappingExposure: 1.2,
                }}
                style={{ touchAction: 'pan-y' }}
              >
                <color attach="background" args={['#1a1a2e']} />
                <fog attach="fog" args={['#1a1a2e', 5, 15]} />

                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
                <directionalLight position={[-3, 3, -3]} intensity={0.4} color="#fff5e6" />
                <pointLight position={[0, 3, 0]} intensity={0.5} color="#ffd700" />

                <WeddingScene groomName={groomName} brideName={brideName} />
                <Environment preset="studio" />
              </Canvas>
            </Suspense>
          </div>

          {/* Info bar */}
          <div className="absolute bottom-6 left-4 right-4 z-10">
            <div
              className="rounded-2xl px-5 py-4 text-center"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className="text-white/50 text-[10px] tracking-wider whitespace-pre-line mb-1">{errorMsg}</p>
              <p className="text-white/70 text-xs tracking-[0.2em] uppercase">3D Viewer Mode</p>
            </div>
          </div>

          {/* 3D badge */}
          <div
            className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-white/80 text-[10px] tracking-widest uppercase font-medium">3D</span>
          </div>
        </>
      )}

      {/* ── Active State: Close Button ── */}
          {status === 'active' && (
            <>
              {/* Close button */}
              <button
                onClick={stopCamera}
                className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Bottom info overlay */}
              <div className="absolute bottom-10 left-6 right-6 z-10">
                <div
                  className="rounded-2xl px-5 py-4 text-center"
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <p className="text-white/60 text-[10px] tracking-[0.2em] uppercase">
                    화면을 터치하여 둘러보세요
                  </p>
                </div>
              </div>

              {/* AR badge */}
              <div
                className="absolute top-6 right-6 z-20 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/80 text-[10px] tracking-widest uppercase font-medium">AR</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
