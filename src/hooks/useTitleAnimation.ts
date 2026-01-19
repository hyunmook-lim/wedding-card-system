'use client';

import { useState } from 'react';
import { useScroll, useMotionValueEvent, Variants, MotionValue } from 'framer-motion';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';

export type TitleAnimationState = 'hidden' | 'visible' | 'top';

interface TitleAnimationThresholds {
  visible: number;
  top: number;
}

interface TitleAnimationVariantConfig {
  hidden?: { y: string; opacity: number; scale: number };
  visible?: { y: number | string; opacity: number; scale: number };
  top?: { y: string; opacity: number; scale: number };
}

interface UseTitleAnimationOptions {
  thresholds?: Partial<TitleAnimationThresholds>;
  variants?: Partial<TitleAnimationVariantConfig>;
  duration?: number;
}

interface UseTitleAnimationReturn {
  animationState: TitleAnimationState;
  titleVariants: Variants;
  scrollYProgress: MotionValue<number>;
}

const DEFAULT_THRESHOLDS: TitleAnimationThresholds = {
  visible: 0.25,
  top: 0.35,
};

const DEFAULT_VARIANT_CONFIG: TitleAnimationVariantConfig = {
  hidden: { y: '480px', opacity: 0, scale: 0.8 },
  visible: { y: 0, opacity: 1, scale: 1.0 },
  top: { y: '-320px', opacity: 1, scale: 0.7 },
};

export function useTitleAnimation(
  options: UseTitleAnimationOptions = {}
): UseTitleAnimationReturn {
  const scrollRef = useStickyScrollRef();
  const [animationState, setAnimationState] = useState<TitleAnimationState>('hidden');

  const thresholds = {
    ...DEFAULT_THRESHOLDS,
    ...options.thresholds,
  };

  const variantConfig = {
    hidden: { ...DEFAULT_VARIANT_CONFIG.hidden, ...options.variants?.hidden },
    visible: { ...DEFAULT_VARIANT_CONFIG.visible, ...options.variants?.visible },
    top: { ...DEFAULT_VARIANT_CONFIG.top, ...options.variants?.top },
  };

  const duration = options.duration ?? 0.8;

  const { scrollYProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'end start'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > thresholds.top) {
      setAnimationState('top');
    } else if (latest > thresholds.visible) {
      setAnimationState('visible');
    } else {
      setAnimationState('hidden');
    }
  });

  const titleVariants: Variants = {
    hidden: {
      ...variantConfig.hidden,
      transition: { duration, ease: 'easeInOut' },
    },
    visible: {
      ...variantConfig.visible,
      transition: { duration, ease: 'easeInOut' },
    },
    top: {
      ...variantConfig.top,
      transition: { duration, ease: 'easeInOut' },
    },
  };

  return {
    animationState,
    titleVariants,
    scrollYProgress,
  };
}
