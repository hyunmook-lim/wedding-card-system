'use client';

import { createContext, useContext, RefObject } from 'react';

export const StickyScrollContext = createContext<RefObject<HTMLElement> | null>(null);

export function useStickyScrollRef() {
  return useContext(StickyScrollContext);
}
