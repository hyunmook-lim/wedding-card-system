"use client";

import { Typography } from "@/components/ui/Typography";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeOut } from "@/components/ui/FadeOut";
import { Button } from "@/components/ui/Button";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { useState, type SVGProps } from "react";

const HeartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

export default function ManualTestPage() {
  const [showFadeOut, setShowFadeOut] = useState(true);

  return (
    <div className="p-8 space-y-12 pb-40">
      <section className="space-y-4">
        <Typography variant="h1">FadeOut Effect Test</Typography>
        <div className="border p-4 rounded-lg space-y-4">
          <Button onClick={() => setShowFadeOut((prev) => !prev)}>
            {showFadeOut ? "Hide Element" : "Show Element"}
          </Button>
          
          <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed relative overflow-hidden">
             <FadeOut isVisible={showFadeOut}>
                <div className="bg-rose-500 text-white p-6 rounded-xl shadow-lg">
                  <Typography variant="h3" className="text-white">I will fade out!</Typography>
                </div>
             </FadeOut>
             {!showFadeOut && (
               <Typography variant="caption" className="absolute">Element is hidden (faded out)</Typography>
             )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <Typography variant="h1">Typography Test</Typography>
        <div className="space-y-2 border p-4 rounded-lg">
          <Typography variant="h1">Heading 1: 우리 결혼합니다</Typography>
          <Typography variant="h2">Heading 2: 2024년 12월 25일</Typography>
          <Typography variant="h3">Heading 3: 그랜드 웨딩홀</Typography>
          <Typography variant="body">
            Body: 서로의 이름을 부르는 것만으로도 사랑의 깊이를 알 수 있는 두 사람이
            하나가 되려 합니다. 부디 오셔서 축복해 주세요.
          </Typography>
          <Typography variant="caption">Caption: ※ 화환은 정중히 사양합니다.</Typography>
          <Typography variant="highlight">Highlight: 12. 25. SAT 12:00 PM</Typography>
        </div>
      </section>

      <section className="space-y-4">
        <Typography variant="h1">Button & Interacton Test</Typography>
        <div className="border p-4 rounded-lg space-y-6">
          
          <div className="space-y-2">
            <Typography variant="h3">Variants</Typography>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Typography variant="h3">Sizes</Typography>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm" variant="primary">Small</Button>
              <Button size="md" variant="primary">Medium (Default)</Button>
              <Button size="lg" variant="primary">Large</Button>
              <Button size="icon" variant="outline">
                 <IconWrapper size={20}><HeartIcon /></IconWrapper>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Typography variant="h3">States</Typography>
            <div className="flex flex-wrap gap-4">
              <Button isLoading>Loading...</Button>
              <Button disabled>Disabled</Button>
              <Button fullWidth>Full Width Button</Button>
            </div>
          </div>

           <div className="space-y-2">
            <Typography variant="h3">Icon Wrapper (Clickable)</Typography>
            <div className="flex items-center gap-8">
              <div className="text-center space-y-1">
                <IconWrapper size={32} className="bg-red-100 rounded-full p-1 text-red-500" onClick={() => alert('Clicked!')}>
                  <HeartIcon />
                </IconWrapper>
                <Typography variant="caption">32px</Typography>
              </div>
              <div className="text-center space-y-1">
                <IconWrapper size={48} className="text-pink-500" onClick={() => alert('Clicked!')}>
                  <HeartIcon />
                </IconWrapper>
                <Typography variant="caption">48px</Typography>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="space-y-4">
        <Typography variant="h1">FadeIn Effect Test</Typography>
        <Typography variant="body">Scroll down to see effects...</Typography>
        
        <div className="space-y-8 py-10">
          <FadeIn direction="up">
            <div className="h-20 bg-blue-100 flex items-center justify-center rounded-lg">
              <Typography variant="h3">Fade Up (Default)</Typography>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.2}>
            <div className="h-20 bg-green-100 flex items-center justify-center rounded-lg">
              <Typography variant="h3">Fade Left (Delay 0.2s)</Typography>
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.4}>
            <div className="h-20 bg-yellow-100 flex items-center justify-center rounded-lg">
              <Typography variant="h3">Fade Right (Delay 0.4s)</Typography>
            </div>
          </FadeIn>
          
           <FadeIn direction="up" duration={1.0}>
            <div className="h-20 bg-purple-100 flex items-center justify-center rounded-lg">
              <Typography variant="h3">Slow Fade Up (1s)</Typography>
            </div>
          </FadeIn>
        </div>
        
        {/* Long spacer to force scrolling */}
        <div className="h-[500px] border-l-2 border-dashed border-gray-300 ml-4 relative">
             <span className="absolute top-2 left-4 text-gray-400">Scroll area...</span>
        </div>

        <FadeIn direction="up">
             <div className="h-32 bg-rose-100 flex items-center justify-center rounded-lg">
              <Typography variant="h2" className="text-rose-800">Final Element</Typography>
            </div>
        </FadeIn>
      </section>
    </div>
  );
}
