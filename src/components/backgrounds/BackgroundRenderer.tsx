'use client';

import { BackgroundConfig } from '@/types/wedding';
import dynamic from 'next/dynamic';

const SolidColorBackground = dynamic(() => import('./SolidColorBackground'));
const ImageBackground = dynamic(() => import('./ImageBackground'));
const EffectsRenderer = dynamic(() => import('../effects/EffectsRenderer'));

// 동적 로딩할 커스텀 배경 컴포넌트 목록
const CUSTOM_COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {
  HeartPulseBackground: dynamic(() => import('./HeartPulseBackground')),
  // 추후 생기는 커스텀 배경 컴포넌트들은 여기에 추가
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

