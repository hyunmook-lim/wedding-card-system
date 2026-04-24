'use client';

import { SectionProps } from '@/types/wedding';
import { useState } from 'react';
import { motion, AnimatePresence, useMotionValueEvent, Variants, useScroll } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import { cn, copyToClipboard } from '@/lib/utils';
import { useStickyScrollRef } from '@/components/ui/StickyScrollContext';
import { LiquidGlassWidget } from '@/components/ui/LiquidGlassWidget';

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

  const colors = {
    groom: {
      accent: 'rgb(70, 90, 110)', // Deep Steel Blue
      bg: 'rgba(70, 90, 110, 0.05)',
      button: 'bg-[#465a6e]',
      text: 'text-[#465a6e]',
    },
    bride: {
      accent: 'rgb(180, 110, 130)', // Muted Rose
      bg: 'rgba(180, 110, 130, 0.05)',
      button: 'bg-[#b46e82]',
      text: 'text-[#b46e82]',
    }
  };

  const theme = colors[type];

  return (
    <div className="w-[85vw] max-w-[360px] mb-6">
      {/* Group Header */}
      <div className="flex items-center space-x-2 mb-3 px-1">
        <div 
          className="w-1.5 h-4 rounded-full" 
          style={{ backgroundColor: theme.accent }}
        />
        <Typography variant="body" className="font-bold text-[0.9rem] tracking-tight opacity-70">
          {label}
        </Typography>
      </div>

      <LiquidGlassWidget 
        className="relative h-[220px] flex items-center justify-center rounded-[2rem] overflow-hidden"
        containerClassName="w-full h-full flex flex-col"
      >
        <AnimatePresence mode="wait">
          {isRevealed ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="w-full h-full divide-y divide-black/5 flex flex-col justify-center"
            >
              {accounts.map((acc, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between px-6 py-[18px] hover:bg-black/5 transition-colors flex-1"
                >
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2.5">
                       <span className="text-[0.6rem] font-extrabold px-1.5 py-0.5 rounded-md bg-black/5 text-black/30 uppercase tracking-widest">
                          {acc.relation}
                       </span>
                       <span className="text-[0.9rem] font-bold text-black/80 tracking-tight">
                          {acc.name}
                       </span>
                    </div>
                    <div className="text-[0.75rem] text-black/40 font-medium tracking-tight">
                      {acc.bank} <span className="opacity-20 mx-1">|</span> {acc.accountNumber}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleCopy(acc.accountNumber, idx)}
                    className={cn(
                      "relative h-8 px-4 rounded-full text-[0.65rem] font-bold transition-all active:scale-90 shadow-sm",
                      copiedIndex === idx 
                        ? "bg-green-500 text-white" 
                        : "bg-black/5 text-black/60 hover:bg-black/10"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={copiedIndex === idx ? 'copied' : 'copy'}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.1 }}
                      >
                        {copiedIndex === idx ? '복사완료' : '복사'}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.button
              key="reveal-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onToggle(true)}
              className="w-full h-full flex flex-col items-center justify-center space-y-2 group cursor-pointer"
            >
              <div 
                className={cn("text-[0.85rem] font-bold tracking-tight transition-transform group-hover:scale-105", theme.text)}
              >
                계좌번호 확인하기
              </div>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg 
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={cn("opacity-40", theme.text)}
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </LiquidGlassWidget>
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
      { relation: '신랑', name: '유영후', bank: '우리은행', accountNumber: '1002 747 550750' },
      { relation: '신랑 아버지', name: '유정호', bank: '국민은행', accountNumber: '286 21 0073 941' },
      { relation: '신랑 어머니', name: '오현미', bank: '국민은행', accountNumber: '655202 01 018442' }
    ],
    bride: [
       { relation: '신부', name: '임예은', bank: '우리은행', accountNumber: '1002 547 570441' },
       { relation: '신부 아버지', name: '임재용', bank: '신한은행', accountNumber: '110 164 865100' },
       { relation: '신부 어머니', name: '허미영', bank: '신한은행', accountNumber: '356 02 308641' }
    ]
  };

  useMotionValueEvent(inViewProgress, "change", (latest) => {
    if (latest > 0.45) {
      setIsInfo(true);
    } else {
      setIsInfo(false);
      setGroomRevealed(false);
      setBrideRevealed(false);
    }

    if (latest > 0.15) {
      setShowTitle(true);
    } else {
      setShowTitle(false);
    }
  });

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.215, 0.61, 0.355, 1.0] 
      }
    }
  };

  const contentVariants: Variants = {
    hidden: { y: 40, opacity: 0 },
    info: { 
      y: 0, 
      opacity: 1,
      transition: { 
        y: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
        opacity: { duration: 0.8, delay: 0.1 },
      }
    }
  };

  if (!isVisible) return null;

  return (
    <section ref={scrollRef} className="relative w-full min-h-[100svh] flex flex-col items-center justify-center py-20 overflow-hidden">


      {/* Title Layer */}
      <motion.div
         initial="hidden"
         animate={showTitle ? "visible" : "hidden"}
         variants={fadeInUp}
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
      <div className="w-full flex flex-col items-center justify-center z-10 shrink-0">
        <AnimatePresence>
          {isInfo && (
            <motion.div
              initial="hidden"
              animate="info"
              exit="hidden"
              variants={contentVariants}
              className="w-full flex flex-col items-center justify-center"
            >
                {/* Description */}
                <div className="text-center mb-10 px-8">
                  <Typography variant="body" className="text-[0.8rem] leading-7 text-black/50 font-medium">
                    {(accountConfig.description || "").split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </Typography>
                </div>

                <div className="space-y-2">
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
