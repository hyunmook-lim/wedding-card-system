'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Kakao: any;
  }
}

export default function KakaoInit() {
  useEffect(() => {
    const initKakao = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '402797996de97afa0b70fad9b4b815ee';
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
