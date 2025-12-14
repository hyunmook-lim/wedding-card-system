export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
       {/* Mobile Container Limit */}
      <div className="w-full max-w-[430px] bg-white min-h-screen shadow-2xl">
        {children}
      </div>
    </div>
  );
}
