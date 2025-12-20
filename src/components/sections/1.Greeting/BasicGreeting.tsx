import { SectionProps } from '@/types/wedding';

export default function BasicGreeting({ config, isVisible }: SectionProps) {
  if (!isVisible) return null;
  
  return (
    <section className="py-20 px-6 text-center space-y-6 bg-white">
      <h2 className="text-2xl font-serif text-gray-900 animate-fade-in">
        {(config.title as string) || '소중한 분들을 초대합니다'}
      </h2>
      <p className="text-gray-600 font-light leading-relaxed whitespace-pre-line">
        {config.message as string}
      </p>
    </section>
  );
}
