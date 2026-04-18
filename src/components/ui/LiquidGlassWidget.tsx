'use client';

import React from 'react';
import { motion, HTMLMotionProps, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import styles from './LiquidGlassWidget.module.css';

export type LiquidGlassVariant = 'menu' | 'dock' | 'button' | 'default';

interface LiquidGlassWidgetProps extends Omit<HTMLMotionProps<'div'>, 'as'> {
  variant?: LiquidGlassVariant;
  as?: React.ElementType;
  containerClassName?: string;
  effectClassName?: string;
  children?: React.ReactNode;
  scrollProgress?: MotionValue<number>; 
}

export const LiquidGlassWidget = React.forwardRef<HTMLDivElement, LiquidGlassWidgetProps>(
  ({ 
    children, 
    variant = 'default', 
    as = motion.div, 
    className, 
    containerClassName,
    effectClassName,
    ...props 
  }, ref) => {
    const rawId = React.useId();
    const filterId = `glass-filter-${rawId.replace(/:/g, '')}`; 
    
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
          ref={ref}
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
