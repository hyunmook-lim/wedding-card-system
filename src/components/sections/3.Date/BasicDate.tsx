import { SectionProps } from '@/types/wedding';
import { formatDate } from '@/lib/utils';

export default function BasicDate({ config, isVisible }: SectionProps) {
  if (!isVisible) return null;

  const { date } = config;

  return (
    <section className="py-16 px-6 bg-white text-center">
      <div>
        <h3 className="text-sm font-bold tracking-widest text-[#aa8f7b] mb-4">DATE</h3>
        <p className="text-xl font-medium text-slate-800">
            {formatDate(date as string)}
        </p>
      </div>
    </section>
  );
}
