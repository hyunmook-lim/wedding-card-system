import BGMPlayer from "@/components/effects/BGMPlayer";

export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center">
       {/* Mobile Container Limit */}
      <div className="w-full max-w-[430px] relative min-h-screen shadow-2xl overflow-x-visible">
        <BGMPlayer />
        {/* Content Layer */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
