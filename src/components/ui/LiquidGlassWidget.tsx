'use client';

import React from 'react';
import { motion, HTMLMotionProps, useVelocity, useSpring, useTransform, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import styles from './LiquidGlassWidget.module.css';

export type LiquidGlassVariant = 'menu' | 'dock' | 'button' | 'default';

interface LiquidGlassWidgetProps extends Omit<HTMLMotionProps<'div'>, 'as'> {
  variant?: LiquidGlassVariant;
  as?: React.ElementType;
  containerClassName?: string;
  effectClassName?: string;
  children?: React.ReactNode;
  scrollProgress?: MotionValue<number>; // Optional scroll progress for dynamic distortion
}

export const LiquidGlassWidget = React.forwardRef<HTMLDivElement, LiquidGlassWidgetProps>(
  ({ 
    children, 
    variant = 'default', 
    as = motion.div, 
    className, 
    containerClassName,
    effectClassName,
    scrollProgress,
    ...props 
  }, ref) => {
    const rawId = React.useId();
    const filterId = `glass-filter-${rawId.replace(/:/g, '')}`; 
    
    // Dynamic 'Squishy' distortion logic - BOOSTED SENSITIVITY
    const velocity = useVelocity(scrollProgress || new MotionValue(0));
    // Softer spring for more 'jelly-like' rebound
    const smoothVelocity = useSpring(velocity, { stiffness: 100, damping: 10 });
    
    // Significantly more sensitive mapping: even slow scrolls cause sloshing
    const dynamicScale = useTransform(
      smoothVelocity, 
      [-0.05, 0, 0.05], 
      [180, 150, 180]
    );

    const dynamicFreq = useTransform(
      smoothVelocity,
      [-0.05, 0, 0.05],
      [0.012, 0.01, 0.012]
    );

    // Turbulence needs frequency as a string
    const baseFreqString = useTransform(dynamicFreq, (f) => `${f} ${f}`);

    // Determine variant class
    const variantClass = variant !== 'default' ? styles[variant] : '';
    const Component = (as || motion.div) as React.ElementType<HTMLMotionProps<'div'>>;

    return (
      <>
        {/* Hidden but active SVG Filter Definition */}
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
            <motion.feTurbulence
              type="fractalNoise"
              baseFrequency={baseFreqString}
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

            <motion.feDisplacementMap
              in="SourceGraphic"
              in2="softMap"
              scale={dynamicScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>

        <Component
          ref={ref}
          className={cn(styles.wrapper, variantClass, className)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          {...props}
        >
          {/* Effect Layer (Liquid Distortion + Blur) */}
          <motion.div 
            className={cn(styles.effect, effectClassName)} 
            style={{ filter: `url(#${filterId})` }}
            variants={{
              tap: { scale: 1.15, filter: `url(#${filterId})` },
              default: { scale: 1, filter: `url(#${filterId})` }
            }}
            whileTap="tap"
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
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
