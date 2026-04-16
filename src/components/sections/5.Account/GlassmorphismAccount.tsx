'use client';

import { SectionProps } from '@/types/wedding';
import { useState } from 'react';
import { motion, AnimatePresence, useMotionValueEvent, Variants, useScroll } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import { cn, copyToClipboard } from '@/lib/utils';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';

type AccountType = 'groom' | 'bride';

interface AccountItem {
  relation: string;
  name: string;
  bank: string;
  accountNumber: string;
}

interface AccountGroupProps {
  type: AccountType;
  label: string;
  accounts: AccountItem[];
  isRevealed: boolean;
  onToggle: (revealed: boolean) => void;
}

function AccountGroup({ type, label, accounts, isRevealed, onToggle }: AccountGroupProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  // Modern Professional Palette
  const colors = {
    groom: {
      accent: 'rgb(70, 90, 110)', // Deep Steel Blue
      bg: 'rgba(70, 90, 110, 0.05)',
      border: 'rgba(70, 90, 110, 0.1)',
      text: 'rgb(50, 70, 90)',
    },
    bride: {
      accent: 'rgb(180, 110, 130)', // Muted Rose
      bg: 'rgba(180, 110, 130, 0.05)',
      border: 'rgba(180, 110, 130, 0.1)',
      text: 'rgb(140, 80, 100)',
    }
  };

  const theme = colors[type];

  return (
    <div className="w-[85vw] max-w-[360px] mb-4">
      {/* Group Header */}
      <div className="flex items-center space-x-2 mb-2 px-1">
        <div 
          className="w-1 h-4 rounded-full" 
          style={{ backgroundColor: theme.accent }}
        />
        <Typography variant="body" className="font-semibold text-[0.95rem] opacity-80">
          {label}
        </Typography>
      </div>

      <div 
        className="relative overflow-hidden rounded-[20px] border border-white/30 w-full bg-white/10 backdrop-blur-md"
        style={{
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1)
          `
        }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)' }}
        />
        <div 
          className="absolute top-0 left-0 w-px h-full pointer-events-none z-10"
          style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.8),transparent,rgba(255,255,255,0.3))' }}
        />
        
        <motion.div 
          className="divide-y divide-black/[0.03]"
          animate={{ opacity: isRevealed ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {accounts.map((acc, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.01] transition-colors"
            >
              <div className="flex flex-col space-y-0.5">
                <div className="flex items-center space-x-2">
                   <span className="text-[0.7rem] font-bold px-1.5 py-0.5 rounded-md bg-black/5 text-black/40 uppercase tracking-tighter">
                      {acc.relation}
                   </span>
                   <span className="text-[0.85rem] font-semibold text-black/80">
                      {acc.name}
                   </span>
                </div>
                <div className="text-[0.75rem] text-black/50 font-medium">
                  {acc.bank} | {acc.accountNumber}
                </div>
              </div>
              
              <button 
                onClick={() => handleCopy(acc.accountNumber, idx)}
                className={cn(
                  "relative h-8 px-3 rounded-full text-[0.7rem] font-bold transition-all active:scale-95 shadow-sm",
                  copiedIndex === idx 
                    ? "bg-green-500 text-white" 
                    : "bg-white border border-black/5 text-black/60 hover:bg-black/5"
                )}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={copiedIndex === idx ? 'copied' : 'copy'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {copiedIndex === idx ? '성공' : '복사'}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          ))}
        </motion.div>

        <AnimatePresence>
          {!isRevealed && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => onToggle(true)}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer group hover:bg-black/[0.01]"
              style={{ 
                backgroundColor: 'transparent',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              <div 
                className="text-[0.9rem] font-medium transition-colors space-x-1"
                style={{ color: theme.accent }}
              >
                계좌번호 확인하기
              </div>
              <svg 
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="opacity-50 group-hover:opacity-80 transition-all group-hover:translate-y-0.5 mt-1"
                style={{ color: theme.accent }}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function GlassmorphismAccount({ isVisible, config }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const { scrollYProgress: inViewProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'start start']
  });

  const [isInfo, setIsInfo] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [groomRevealed, setGroomRevealed] = useState(false);
  const [brideRevealed, setBrideRevealed] = useState(false);

  // Cast config to proper structure
  const accountConfig = config?.content as {
    description?: string;
    groom: AccountItem[];
    bride: AccountItem[];
  } || {
    description: "참석이 어려우신 분들을 위해\n계좌번호를 기재하였습니다.\n너그러운 마음으로 양해 부탁드립니다.",
    groom: [
      { relation: '신랑', name: '임현묵', bank: '카카오뱅크', accountNumber: '3333-27-9074957' },
      { relation: '신랑 아버지', name: '임재용', bank: '신한은행', accountNumber: '110-164-865100' },
      { relation: '신랑 어머니', name: '허미영', bank: '신한은행', accountNumber: '356-02-308641' }
    ],
    bride: [
       { relation: '신부', name: '최가람', bank: '카카오뱅크', accountNumber: '3333-11-9485874' },
       { relation: '신부 아버지', name: '최상욱', bank: '하나은행', accountNumber: '443-910174-15307' },
       { relation: '신부 어머니', name: '심재술', bank: '하나은행', accountNumber: '251-910133-22707' }
    ]
  };

  // 화면 진입 시 타이틀 등장 트랜지션 (inViewProgress 기준)
  useMotionValueEvent(inViewProgress, "change", (latest) => {
    // 트리거 시점을 0.2 -> 0.45로 늦춰서 더 자연스럽게 등장하도록 개선
    if (latest > 0.45) {
      setIsInfo(true);
    } else {
      setIsInfo(false);
      setGroomRevealed(false);
      setBrideRevealed(false);
    }

    if (latest > 0.25) {
      setShowTitle(true);
    } else {
      setShowTitle(false);
    }
  });

  const contentVariants: Variants = {
    hidden: { y: "40px", opacity: 0 },
    visible: { y: "40px", opacity: 0 },
    top: { y: "40px", opacity: 0 },
    info: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 1.2, ease: "circOut", delay: 0.2 }
    }
  };

  if (!isVisible) return null;

  return (
    <section ref={scrollRef} className="relative w-full min-h-[100svh] flex flex-col items-center justify-center py-20 overflow-hidden">
      {/* Title Layer */}
      <motion.div
         initial={{ opacity: 0, y: 50 }}
         animate={{ 
           opacity: showTitle ? 1 : 0, 
           y: showTitle ? 0 : 50 
         }}
         transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
         style={{ 
           scale: 0.55, 
           transformOrigin: "top center",
           willChange: "transform, opacity"
         }}
         className="w-full flex flex-col items-center z-30 pointer-events-none mb-6 shrink-0"
      >
           <div className="flex flex-col items-center justify-center">
             <div className="flex items-center space-x-3 mb-4 opacity-30">
               <div className="w-8 h-[0.5px] bg-black" />
               <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-black/80">
                 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
               </svg>
               <div className="w-8 h-[0.5px] bg-black" />
             </div>
             
             <Typography 
               className="font-serif text-[1.6rem] tracking-[0.15em] text-black/80 font-medium py-0 px-0 border-none"
             >
               마음 전하실 곳
             </Typography>
             
             <Typography 
               className="text-[0.6rem] tracking-[0.4em] text-black/40 mt-3 font-light uppercase opacity-80"
             >
               A Token of Gratitude
             </Typography>
           </div>
      </motion.div>

      {/* Account Info Layer */}
      <div className="w-full flex flex-col items-center justify-center min-h-[400px] z-10 shrink-0 perspective-[1000px]">
        <AnimatePresence>
          {isInfo && (
            <motion.div
              initial="hidden"
              animate="info"
              exit="hidden"
              variants={contentVariants}
              className="w-full flex flex-col items-center justify-center"
              style={{ willChange: "transform, opacity" }}
            >
                {/* Description */}
                <div className="text-center mb-6 px-6">
                  <Typography variant="body" className="text-[0.85rem] leading-7 text-black/60 font-medium">
                    {(accountConfig.description || "").split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </Typography>
                </div>

                <motion.div 
                  className="space-y-4"
                  layout
                >
                  <AccountGroup 
                    type="groom" 
                    label="신랑측" 
                    isRevealed={groomRevealed}
                    onToggle={setGroomRevealed}
                    accounts={accountConfig.groom} 
                  />

                  <AccountGroup 
                    type="bride" 
                    label="신부측"
                    isRevealed={brideRevealed}
                    onToggle={setBrideRevealed}
                    accounts={accountConfig.bride} 
                  />
                </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
