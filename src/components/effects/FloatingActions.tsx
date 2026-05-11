'use client';

import BGMPlayer from './BGMPlayer';
import ShareButton from './ShareButton';

export default function FloatingActions({ weddingId }: { weddingId: string }) {
  return (
    <div className="fixed top-5 right-5 z-[100] md:right-[calc(50%-215px+20px)] flex flex-col gap-3">
      <BGMPlayer />
      <ShareButton weddingId={weddingId} />
    </div>
  );
}
