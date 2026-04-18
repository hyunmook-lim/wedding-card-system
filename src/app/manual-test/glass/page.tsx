'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LiquidGlassWidget } from '@/components/ui/LiquidGlassWidget';
import { Typography } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

const BACKGROUNDS = [
  {
    name: 'Flowers (Default)',
    url: 'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/flowers.jpg',
  },
  {
    name: 'Green Mistletoe',
    url: 'https://media.istockphoto.com/id/1430511443/vector/christmas-mistletoe-foliage-and-berries-vector-seamless-pattern.jpg?s=612x612&w=0&k=20&c=oqxlH7ytgd5yjBQroACirJ1gH7Au1tq8gmsdeGd-Crk=',
  },
  {
    name: 'Orange Floral',
    url: 'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/beautiful-orange-and-pastel-flowers-seamless-pattern-julien.jpg',
  },
  {
    name: 'Margaritas',
    url: 'https://static.vecteezy.com/system/resources/previews/056/652/082/non_2x/hand-drawn-white-flower-seamless-pattern-floral-repeating-wallpaper-for-textile-design-fabric-print-wrapping-paper-cute-daisy-flowers-on-blue-background-repeated-ditsy-texture-vector.jpg',
  },
  {
    name: 'Spring',
    url: 'https://img.freepik.com/free-vector/flat-floral-spring-pattern-design_23-2150117078.jpg',
  },
  {
    name: 'Vector Winds',
    url: 'https://i.ibb.co/MDbLn4N4/vectors.png',
  },
];

export default function GlassTestPage() {
  const [bgIndex, setBgIndex] = useState(0);

  return (
    <div 
      className="min-h-screen transition-all duration-1000 ease-in-out flex flex-col items-center justify-center gap-12 p-8"
      style={{ 
        backgroundImage: `url(${BACKGROUNDS[bgIndex].url})`,
        backgroundSize: bgIndex === 5 ? 'cover' : '500px',
        backgroundPosition: 'center'
      }}
    >
      {/* Background Switcher */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-2 z-50 overflow-x-auto max-w-[90vw] pb-2 no-scrollbar">
        {BACKGROUNDS.map((bg, idx) => (
          <button
            key={bg.name}
            onClick={() => setBgIndex(idx)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-md border",
              bgIndex === idx 
                ? "bg-black text-white border-black" 
                : "bg-white/80 text-black border-white/40 backdrop-blur-sm hover:bg-white"
            )}
          >
            {bg.name}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col items-end gap-8 w-full max-w-md mt-16">
        
        {/* Menu Variant */}
        <div className="w-full flex justify-end">
          <LiquidGlassWidget variant="menu" className="flex flex-col min-w-[200px]">
            <div className="px-5 py-3 hover:bg-white/40 rounded-xl transition-all cursor-pointer text-sm font-semibold flex items-center justify-between group">
              <span>New Wedding Date</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
            <div className="px-5 py-3 hover:bg-white/40 rounded-xl transition-all cursor-pointer text-sm font-semibold flex items-center justify-between group">
              <span>Gallery Settings</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
            <div className="px-5 py-3 hover:bg-white/40 rounded-xl transition-all cursor-pointer text-sm font-semibold flex items-center justify-between group">
              <span>RSVP Repository</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </LiquidGlassWidget>
        </div>

        {/* Dock Variant */}
        <LiquidGlassWidget variant="dock" className="flex items-center gap-4">
          {[
            'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/finder.png',
            'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/map.png',
            'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/messages.png',
            'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/notes.png',
            'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/safari.png'
          ].map((src, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.2, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="cursor-pointer"
            >
                <Image 
                  src={src} 
                  alt={`Icon ${i}`} 
                  width={56} 
                  height={56} 
                  className="object-contain" 
                  unoptimized 
                />
            </motion.div>
          ))}
        </LiquidGlassWidget>

        {/* Button Variant */}
        <LiquidGlassWidget variant="button">
          <Typography className="text-xl font-bold tracking-tight text-gray-900 drop-shadow-sm">
            INVITATION
          </Typography>
        </LiquidGlassWidget>

      </div>

      <div className="fixed bottom-8 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-black/60 text-xs font-semibold shadow-sm">
        Viewing: {BACKGROUNDS[bgIndex].name}
      </div>
    </div>
  );
}
