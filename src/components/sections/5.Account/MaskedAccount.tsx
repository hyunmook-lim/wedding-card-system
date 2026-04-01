'use client';

import { SectionProps } from '@/types/wedding';
import { useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValueEvent, Variants } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import { cn, copyToClipboard } from '@/lib/utils';
import { useTitleAnimation } from '@/hooks/useTitleAnimation';

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

      <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md shadow-lg ring-1 ring-black/5">
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div
              key="reveal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => onToggle(true)}
              className="group cursor-pointer py-5 flex flex-col items-center justify-center space-y-1 transition-all hover:bg-black/[0.02]"
            >
              <div 
                className="text-[0.9rem] font-medium transition-colors"
                style={{ color: theme.accent }}
              >
                계좌번호 확인하기
              </div>
              <svg 
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="opacity-40 group-hover:opacity-60 transition-all group-hover:translate-y-0.5"
                style={{ color: theme.accent }}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="account-list"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="divide-y divide-black/[0.03]"
            >
              {accounts.map((acc, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 hover:bg-black/[0.01] transition-colors"
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function MaskedAccount({ isVisible, config }: SectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { animationState: baseState, titleVariants: baseTitleVariants, scrollYProgress } = useTitleAnimation({
    variants: {
      top: { y: '-350px', opacity: 1, scale: 0.7 }
    }
  });
  const [groomRevealed, setGroomRevealed] = useState(false);
  const [brideRevealed, setBrideRevealed] = useState(false);
  const [isInfo, setIsInfo] = useState(false);

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

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.50) {
      setIsInfo(true);
    } else {
      setIsInfo(false);
      setGroomRevealed(false);
      setBrideRevealed(false);
    }
  });

  const animationState = isInfo ? 'info' : baseState;

  const titleVariants: Variants = {
    ...baseTitleVariants,
    info: {
      y: '-350px',
      opacity: 1,
      scale: 0.7, 
      transition: { duration: 0.8, ease: "circOut" }
    }
  };

  const contentVariants: Variants = {
    hidden: { y: "40px", opacity: 0 },
    visible: { y: "40px", opacity: 0 },
    top: { y: "40px", opacity: 0 },
    info: { 
      y: 10, 
      opacity: 1,
      transition: { duration: 1.0, ease: "circOut", delay: 0.1 }
    }
  };

  if (!isVisible) return null;

  return (
    <section ref={containerRef} className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-transparent overflow-hidden perspective-[1000px]">
        {/* Title Layer */}
        <motion.div
           initial="hidden"
           animate={animationState}
           variants={titleVariants}
           className="absolute z-20 text-center w-full px-4"
           style={{ willChange: "transform, opacity" }}
        >
             <div className="flex flex-col items-center justify-center">
               <div className="flex items-center space-x-3 mb-4 opacity-30">
                 <div className="w-8 h-[0.5px] bg-black" />
                 {/* Small Heart SVG for Stationery look */}
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
        <AnimatePresence>
          {isInfo && (
            <motion.div
              initial="hidden"
              animate="info"
              exit="hidden"
              variants={contentVariants}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-36 pb-8 overflow-y-auto custom-scrollbar"
              style={{ willChange: "transform, opacity" }}
            >
                {/* Description */}
                <motion.div 
                  className="text-center mb-10 px-6"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: (groomRevealed || brideRevealed) ? 0 : 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <Typography variant="body" className="text-[0.85rem] leading-7 text-black/60 font-medium">
                    {(accountConfig.description || "").split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </Typography>
                </motion.div>

                <div className="space-y-4">
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
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
