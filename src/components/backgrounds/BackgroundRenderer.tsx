'use client';

import { BackgroundConfig } from '@/types/wedding';
import dynamic from 'next/dynamic';

const SolidColorBackground = dynamic(() => import('./SolidColorBackground'));
const ImageBackground = dynamic(() => import('./ImageBackground'));
const EffectsRenderer = dynamic(() => import('../effects/EffectsRenderer'));

// --- 동적 렌더링할 커스텀 배경 컴포넌트 레지스트리 ---
// 앱에 사용될 모든 커스텀 배경 컴포넌트를 여기에 등록합니다.
// next/dynamic을 사용하여 코드 스플리팅 적용 (초기 로딩 속도 최적화)
const CUSTOM_COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {
  // 예시: 쿵쾅거리는 하트 배경
  // 'HeartPulse': dynamic(() => import('./HeartPulseBackground'), { ssr: false }),
  // 향후 다른 화면에서 쓰일 커스텀 배경들...
  'CardSpreadBackground': dynamic(() => import('./CardSpreadBackground'), { ssr: false }),
};

interface BackgroundRendererProps {
  config?: BackgroundConfig;
}

export default function BackgroundRenderer({ config }: BackgroundRendererProps) {
  // 기본 배경색 설정이 없으면 프로젝트 기본색을 반환
  if (!config) return <div className="absolute inset-0 z-0 bg-[#fffdf7]" />;

  // 1-1. Custom Component Layer (type === 'component' 인 경우 우선 처리)
  if (config.type === 'component' && config.componentName) {
    const CustomBackground = CUSTOM_COMPONENTS[config.componentName];
    if (CustomBackground) {
      return (
        <div 
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none" 
          style={{ opacity: config.opacity ?? 1 }}
        >
          <CustomBackground {...(config.effectConfig || {})} />
          <EffectsRenderer effects={config.effects} effectConfig={config.effectConfig} />
        </div>
      );
    }
  }

  return (
    <div 
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none" 
      style={{ opacity: config.opacity ?? 1 }}
    >
      {/* 1-2. Base Background Layer (color or image) */}
      {config.type === 'color' && config.value && (
        <SolidColorBackground color={config.value} />
      )}
      
      {config.type === 'image' && config.value && (
        <ImageBackground imageUrl={config.value} />
      )}
      
      {/* 2. Effect Animation Layer (Overlays Base Background) */}
      <EffectsRenderer effects={config.effects} effectConfig={config.effectConfig} />
    </div>
  );
}

