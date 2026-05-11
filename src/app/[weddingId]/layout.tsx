import FloatingActions from "@/components/effects/FloatingActions";

export default async function WeddingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center">
       {/* Mobile Container Limit */}
      <div className="w-full max-w-[430px] relative min-h-screen shadow-2xl overflow-x-visible">
        <FloatingActions weddingId={weddingId} />
        {/* Content Layer */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
