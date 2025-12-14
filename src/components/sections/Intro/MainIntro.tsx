import { SectionProps } from '@/types/wedding';
import Image from 'next/image';

export default function MainIntro({ config, isVisible }: SectionProps) {
  if (!isVisible) return null;
  
  const { mainImage, title } = config as { mainImage?: string; title?: string };

  return (
    <section className="relative w-full aspect-[3/4] bg-gray-200 overflow-hidden">
        {mainImage ? (
             <Image
                src={mainImage}
                alt="Main Cover"
                fill
                className="object-cover"
                priority
             />
        ) : (
             <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Wedding Photo
             </div>
        )}
        
        <div className="absolute bottom-10 left-0 w-full text-center z-10 p-4">
             <h1 className="text-3xl font-serif text-white custom-shadow drop-shadow-lg">
                {title || 'The Wedding Day'}
             </h1>
        </div>
    </section>
  );
}
