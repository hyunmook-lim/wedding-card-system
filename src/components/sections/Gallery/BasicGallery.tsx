import { SectionProps } from '@/types/wedding';
import Image from 'next/image';

export default function BasicGallery({ config, isVisible }: SectionProps) {
  if (!isVisible) return null;

  const images = config.images || [];

  return (
    <section className="py-16 bg-white">
      <h3 className="text-center font-serif text-xl mb-8">Gallery</h3>
      <div className="grid grid-cols-3 gap-1 px-1">
        {images.map((src: string, idx: number) => (
          <div key={idx} className="relative aspect-square bg-gray-100 relative">
             <Image 
               src={src || '/placeholder.png'} 
               alt={`Gallery image ${idx + 1}`}
               fill
               className="object-cover"
             />
          </div>
        ))}
      </div>
    </section>
  );
}
