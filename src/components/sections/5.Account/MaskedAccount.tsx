'use client';

import { SectionProps } from '@/types/wedding';
import { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, Variants } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';
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

  // Colors
  const activeColor = type === 'groom' ? 'rgb(93, 138, 168)' : 'rgb(205, 150, 165)';
  
  // Gradient for Name
  const nameGradient = type === 'groom' 
    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, rgba(93, 138, 168, 0.3) 50%)'
    : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, rgba(205, 150, 165, 0.3) 50%)';

  return (
    <div className="relative flex flex-col items-center justify-center w-[70vw] max-w-xs p-1 mt-1 opacity-100 transition-opacity duration-1000">
      {/* Name Title */}
      <div 
        className="w-full text-center text-[1.1rem] mb-0.5"
        style={{ background: nameGradient }}
      >
        <Typography variant="body" style={{ color: 'rgb(29, 29, 31)' }}>{label}</Typography>
      </div>

      {/* Account List Area */}
      <div className="relative w-full">
         {/* Cover Overlay */}
         <div 
            onClick={() => onToggle(true)}
            className={cn(
               "absolute inset-0 flex justify-center items-center text-[1.1rem] transition-all duration-1000 z-20 cursor-pointer bg-white/95",
               isRevealed ? "opacity-0 pointer-events-none z-[-100]" : "opacity-100"
            )}
            style={{ color: activeColor }}
         >
            확인하기
         </div>

         {/* Accounts */}
         <div className={cn("transition-opacity duration-1000", isRevealed ? "opacity-100" : "opacity-0")}>
            {accounts.map((acc, idx) => (
               <div 
                 key={idx} 
                 className="w-full py-1 px-[5px] flex justify-between items-center text-[0.75rem] border-b border-[rgb(211,211,211)] last:border-0"
               >
                  <div className="leading-snug">
                     <div style={{ color: activeColor }} className="font-bold mb-0">
                        <Typography variant="body" className="font-bold text-inherit text-[0.75rem]">{acc.relation}</Typography>
                     </div>
                     <Typography variant="body" className="text-[0.7rem] text-gray-600 leading-tight">{acc.accountNumber}</Typography>
                     <Typography variant="body" className="text-[0.7rem] text-gray-600 leading-tight">{acc.bank} {acc.name}</Typography>
                  </div>
                  <button className="font-bold cursor-pointer" style={{ color: activeColor }}>
                     <Typography variant="caption" className="font-bold text-inherit text-[0.65rem]">복사</Typography>
                  </button>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

export default function MaskedAccount({ isVisible }: SectionProps) {
  const scrollRef = useStickyScrollRef();
  const containerRef = useRef<HTMLElement>(null);
  const [animationState, setAnimationState] = useState<'hidden' | 'visible' | 'top' | 'info'>('hidden');
  const [groomRevealed, setGroomRevealed] = useState(false);
  const [brideRevealed, setBrideRevealed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: scrollRef || undefined,
    offset: ['start end', 'end start']
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.50) {
      setAnimationState('info');
    } else if (latest > 0.35) {
      setAnimationState('top');
      // Reset reveal states when scrolling back up/down out of info view
      setGroomRevealed(false);
      setBrideRevealed(false);
    } else if (latest > 0.25) {
      setAnimationState('visible');
      setGroomRevealed(false);
      setBrideRevealed(false);
    } else {
      setAnimationState('hidden');
      setGroomRevealed(false);
      setBrideRevealed(false);
    }
  });

  const titleVariants: Variants = {
    hidden: { 
      y: "30lvh", 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 1.0, ease: "easeInOut" }
    },
    visible: { 
      y: 0,
      opacity: 1, 
      scale: 1,
      transition: { duration: 1.0, ease: "easeInOut" }
    },
    top: {
      y: "-40lvh",
      opacity: 1,
      scale: 0.8,
      transition: { duration: 0.8, ease: "easeInOut" }
    },
    info: {
      y: "-40lvh",
      opacity: 1,
      scale: 0.8,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const contentVariants: Variants = {
    hidden: { y: "50px", opacity: 0 },
    visible: { y: "50px", opacity: 0 },
    top: { y: "50px", opacity: 0 },
    info: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 1.0, ease: "easeInOut", delay: 0.2 }
    }
  };

  if (!isVisible) return null;

  return (
    <section ref={containerRef} className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden perspective-[1000px]">
        {/* Title Layer */}
        <motion.div
           initial="hidden"
           animate={animationState}
           variants={titleVariants}
           className="absolute z-20 text-center w-full px-4"
        >
             <Typography variant="display">
                 마음 전하실 곳
             </Typography>
        </motion.div>

        {/* Account Info Layer */}
        <motion.div
          initial="hidden"
          animate={animationState}
          variants={contentVariants}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-1"
        >
             {/* Description moved here */}
             <div className="text-center mb-1">
                <Typography variant="body" className="text-[0.8rem] leading-relaxed">
                   참석이 어려우신 분들을 위해<br/>
                   계좌번호를 기재하였습니다.<br/>
                   너그러운 마음으로 양해 부탁드립니다.
                </Typography>
             </div>

            <AccountGroup 
              type="groom" 
              label="신랑측" 
              isRevealed={groomRevealed}
              onToggle={setGroomRevealed}
              accounts={[
                { relation: '신랑', name: '임현묵', bank: '카카오뱅크', accountNumber: '3333-27-9074957' },
                { relation: '신랑 아버지', name: '임재용', bank: '신한은행', accountNumber: '110-164-865100' },
                { relation: '신랑 어머니', name: '허미영', bank: '신한은행', accountNumber: '356-02-308641' }
              ]} 
            />

            <AccountGroup 
              type="bride" 
              label="신부측"
              isRevealed={brideRevealed}
              onToggle={setBrideRevealed}
              accounts={[
                 { relation: '신부', name: '최가람', bank: '카카오뱅크', accountNumber: '3333-11-9485874' },
                 { relation: '신부 아버지', name: '최상욱', bank: '하나은행', accountNumber: '443-910174-15307' },
                 { relation: '신부 어머니', name: '심재술', bank: '하나은행', accountNumber: '251-910133-22707' }
              ]} 
            />
        </motion.div>
      </div>
    </section>
  );
}
