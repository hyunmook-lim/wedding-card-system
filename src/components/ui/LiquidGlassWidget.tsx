'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, HTMLMotionProps, useAnimate } from 'framer-motion';
import { cn } from '@/lib/utils';
import styles from './LiquidGlassWidget.module.css';

export type LiquidGlassVariant = 'menu' | 'dock' | 'button' | 'default';

interface LiquidGlassWidgetProps extends Omit<HTMLMotionProps<'div'>, 'as'> {
  variant?: LiquidGlassVariant;
  as?: React.ElementType;
  containerClassName?: string;
  effectClassName?: string;
  children?: React.ReactNode;

  /** Disable the scroll-stop jiggle animation */
  disableJiggle?: boolean;
}

/**
 * Hook that detects scroll-stop events and triggers the jiggle animation.
 * Uses a debounce to detect when the user stops scrolling,
 * then measures scroll velocity to determine jiggle intensity.
 */
function useScrollStopJiggle(
  scope: React.RefObject<HTMLElement | null>,
  disabled: boolean
) {
  const [, animate] = useAnimate();
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollYRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const triggerJiggle = useCallback(
    async (velocity: number) => {
      if (!scope.current || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      // Clamp velocity influence: higher velocity = more pronounced jiggle
      const intensity = Math.min(Math.abs(velocity) / 3000, 1);
      // Minimum threshold — don't animate for very slow/gentle stops
      if (intensity < 0.05) {
        isAnimatingRef.current = false;
        return;
      }

      const scaleAmplitude = 0.015 + intensity * 0.025; // 1.5% ~ 4% squeeze

      try {
        // Squash phase: compress Y, expand X (like a soft jelly landing)
        await animate(
          scope.current,
          {
            scaleX: 1 + scaleAmplitude,
            scaleY: 1 - scaleAmplitude,
          },
          {
            duration: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }
        );
        // Stretch bounce back (overshoot slightly)
        await animate(
          scope.current,
          {
            scaleX: 1 - scaleAmplitude * 0.5,
            scaleY: 1 + scaleAmplitude * 0.5,
          },
          {
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }
        );
        // Settle back to normal
        await animate(
          scope.current,
          {
            scaleX: 1,
            scaleY: 1,
          },
          {
            type: 'spring',
            stiffness: 400,
            damping: 15,
            mass: 0.8,
          }
        );
      } catch {
        // Animation interrupted — that's fine
      } finally {
        isAnimatingRef.current = false;
      }
    },
    [scope, animate]
  );

  useEffect(() => {
    if (disabled) return;

    const SCROLL_STOP_DELAY = 100; // ms to wait before considering scroll "stopped"

    const handleScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;

      // Calculate velocity (px/ms -> px/s)
      const dt = now - lastScrollTimeRef.current;
      const dy = currentY - lastScrollYRef.current;
      const velocity = dt > 0 ? (dy / dt) * 1000 : 0;

      lastScrollYRef.current = currentY;
      lastScrollTimeRef.current = now;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set a new timeout — fires when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        triggerJiggle(velocity);
      }, SCROLL_STOP_DELAY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [disabled, triggerJiggle]);
}

export const LiquidGlassWidget = React.forwardRef<HTMLDivElement, LiquidGlassWidgetProps>(
  ({ 
    children, 
    variant = 'default', 
    as = motion.div, 
    className, 
    containerClassName,
    effectClassName,

    disableJiggle = false,
    ...props 
  }, ref) => {
    const rawId = React.useId();
    const filterId = `glass-filter-${rawId.replace(/:/g, '')}`;
    
    // Internal ref for scroll-stop jiggle animation
    const internalRef = useRef<HTMLDivElement>(null);
    // Merge external ref with internal ref
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref]
    );

    // Scroll-stop jiggle effect
    useScrollStopJiggle(internalRef, disableJiggle);
    
    // Determine variant class
    const variantClass = variant !== 'default' ? styles[variant] : '';
    const Component = (as || motion.div) as React.ElementType<HTMLMotionProps<'div'>>;

    return (
      <>
        {/* Static SVG Filter Definition (No animations) */}
        <svg 
          width="0" 
          height="0" 
          className="absolute pointer-events-none invisible" 
          style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
          aria-hidden="true"
        >
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            filterUnits="objectBoundingBox"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.01"
              numOctaves="1"
              seed="5"
              result="turbulence"
            />
            <feComponentTransfer in="turbulence" result="mapped">
              <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
              <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
              <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
            </feComponentTransfer>

            <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />

            <feSpecularLighting
              in="softMap"
              surfaceScale="5"
              specularConstant="1"
              specularExponent="100"
              lightingColor="white"
              result="specLight"
            >
              <fePointLight x="-200" y="-200" z="300" />
            </feSpecularLighting>

            <feComposite
              in="specLight"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
              result="litImage"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="softMap"
              scale="150"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>

        <Component
          ref={mergedRef}
          className={cn(styles.wrapper, variantClass, className)}
          {...props}
        >
          {/* Effect Layer (Static Distortion + Blur) */}
          <div 
            className={cn(styles.effect, effectClassName)} 
            style={{ filter: `url(#${filterId})` }}
          />
          
          {/* Tint Layer (Color Overlay) */}
          <div className={styles.tint} />
          
          {/* Shine Layer (Inner Shadows/Highlights) */}
          <div className={styles.shine} />
          
          {/* Text/Content Layer */}
          <div className={cn(styles.text, containerClassName)}>
            {children}
          </div>
        </Component>
      </>
    );
  }
);

LiquidGlassWidget.displayName = 'LiquidGlassWidget';
