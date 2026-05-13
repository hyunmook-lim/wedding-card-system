'use client';

import { useEffect } from 'react';

export default function ImageProtector() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('img')) {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('img')) {
        e.preventDefault();
        return false;
      }
    };

    // 터치 이벤트 시작 시 롱프레스 메뉴 방지 (일부 브라우저용)
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('img')) {
        // iOS 등에서 텍스트 선택이나 시스템 메뉴 방지를 위해 추가적인 처리 필요 시 여기에 작성
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    // document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      // document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return null;
}
