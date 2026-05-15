'use client';

import { useEffect } from 'react';


export default function KakaoInit() {
  useEffect(() => {
    const initKakao = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '582d0ff214b1bf60c65cf4bd6954309f';
        window.Kakao.init(key);
      }
    };

    if (window.Kakao) {
      initKakao();
    } else {
      // If script is not loaded yet, wait for it
      const interval = setInterval(() => {
        if (window.Kakao) {
          initKakao();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  return null;
}

