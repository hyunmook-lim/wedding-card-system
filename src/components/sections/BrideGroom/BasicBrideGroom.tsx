import { SectionProps } from '@/types/wedding';


interface BrideGroomConfig {
  groom?: { name: string; relation: string };
  bride?: { name: string; relation: string };
}

export default function BasicBrideGroom({ config, isVisible }: SectionProps) {
  if (!isVisible) return null;
  
  const { groom, bride } = config as unknown as BrideGroomConfig;

  return (
    <section className="py-16 px-6 bg-gray-50 text-center">
      <div className="flex justify-center items-center space-x-8">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">{groom?.relation}</p>
          <p className="text-xl font-medium text-gray-900">{groom?.name}</p>
        </div>
        <span className="text-gray-300 text-xl">&</span>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">{bride?.relation}</p>
          <p className="text-xl font-medium text-gray-900">{bride?.name}</p>
        </div>
      </div>
    </section>
  );
}
