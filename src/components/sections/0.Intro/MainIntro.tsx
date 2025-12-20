import { SectionProps } from '@/types/wedding';
import Image from 'next/image';

export default function MainIntro({ config, isVisible, onEnter }: SectionProps) {
  if (!isVisible) return null;
  
  const { mainImage, title } = config as { mainImage?: string; title?: string };

  return (
    <section 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white cursor-pointer"
      onClick={onEnter}
    >
        <div className="relative w-full h-full">
            {mainImage ? (
                <Image
                    src={mainImage}
                    alt="Main Cover"
                    fill
                    className="object-cover"
                    priority
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                    Wedding Photo
                </div>
            )}
            
            <div className="absolute inset-0 bg-black/20" /> {/* Dim overlay */}

            <div className="absolute bottom-20 left-0 w-full text-center z-10 p-6 animate-fade-in-up">
                <h1 className="text-4xl font-serif text-white drop-shadow-lg mb-4">
                    {title || 'The Wedding Day'}
                </h1>
            </div>
        </div>
    </section>
  );
}
