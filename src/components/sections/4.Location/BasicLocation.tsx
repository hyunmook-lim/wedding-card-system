import { SectionProps } from '@/types/wedding';

export default function BasicLocation({ config, isVisible }: SectionProps) {
  if (!isVisible) return null;

  interface LocationConfig {
    location?: {
      name: string;
      address: string;
      mapUrl?: string;
    };
  }

  const { location } = config as unknown as LocationConfig;

  return (
    <section className="py-16 px-6 bg-[#fffdf7] text-center">
      <div>
        <h3 className="text-sm font-bold tracking-widest text-[#aa8f7b] mb-4">LOCATION</h3>
        <p className="text-xl font-medium text-slate-800 mb-2">{location?.name}</p>
        <p className="text-gray-500 text-sm mb-6">{location?.address}</p>
        
        {location?.mapUrl && (
          <a
            href={location.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
          >
            지도 보기
          </a>
        )}
      </div>
    </section>
  );
}
