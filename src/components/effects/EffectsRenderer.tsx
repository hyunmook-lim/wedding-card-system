'use client';

import dynamic from 'next/dynamic';

const SnowEffect = dynamic(() => import('./SnowEffect'));
// 추후 벚꽃 등 다른 효과를 여기에 추가합니다.
// const CherryBlossomEffect = dynamic(() => import('./CherryBlossomEffect'));

interface EffectsRendererProps {
  effects?: string[]; // 여러 개의 이펙트 이름 배열 (예: ['snow'])
  effectConfig?: Record<string, unknown>; // 구체적인 설정 (파티클 개수 등)
}

export default function EffectsRenderer({ effects, effectConfig }: EffectsRendererProps) {
  if (!effects || effects.length === 0) return null;

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden object-cover">
      {/* 배열에 들어있는 각 이펙트 타입에 따라 렌더링 */}
      {effects.map((effectType, idx) => {
        switch (effectType) {
          case 'snow':
            return <SnowEffect key={idx} particleCount={effectConfig?.particleCount as number | undefined} />;
          // case 'blossom': 
          //   return <CherryBlossomEffect key={idx} />;
          default:
            return null; // 매칭되지 않는 효과 무시
        }
      })}
    </div>
  );
}
