'use client';

import { createContext, useContext } from 'react';

/** url → preloaded HTMLVideoElement 매핑 */
export type PreloadedMediaMap = Map<string, HTMLVideoElement>;

/**
 * SectionRegistry가 프리로드한 video 엘리먼트 객체를 공유하는 Context.
 * ref가 아닌 Map 인스턴스를 직접 넘기므로 render 중에도 안전하게 읽을 수 있습니다.
 * (preloading 완료 후 state 업데이트로 새 Map 인스턴스가 주입됩니다)
 */
export const PreloadedMediaContext = createContext<PreloadedMediaMap>(new Map());

/** src URL에 해당하는 프리로드된 HTMLVideoElement를 반환합니다. */
export function usePreloadedVideo(src: string): HTMLVideoElement | null {
  const map = useContext(PreloadedMediaContext);
  return map.get(src) ?? null;
}
