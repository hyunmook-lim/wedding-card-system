import { getWedding } from '@/lib/fetch-wedding';
import SectionRegistry from '@/components/SectionRegistry';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ weddingId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { weddingId } = await params;
  const wedding = await getWedding(weddingId);
  
  if (!wedding) return {};

  return {
    title: `${wedding.couple.groom.name} & ${wedding.couple.bride.name}의 결혼식`,
    description: `${wedding.event.location.name}에서`,
  };
}

export default async function WeddingPage({ params }: PageProps) {
  const { weddingId } = await params;
  const wedding = await getWedding(weddingId);

  if (!wedding) {
    notFound();
  }

  // Pre-process section content if needed (e.g. merge global data into sections)
  const sectionsWithData = wedding.sections.map(section => {
    if (section.type === 'date') {
      return {
        ...section,
        content: {
          ...section.content,
          date: wedding.event.date
        }
      };
    }
    if (section.type === 'location') {
      return {
        ...section,
        content: {
          ...section.content,
          location: wedding.event.location
        }
      };
    }
    if (section.type === 'bride_groom') {
      return {
        ...section,
        content: {
          ...section.content,
          groom: wedding.couple.groom,
          bride: wedding.couple.bride
        }
      };
    }
    return section;
  });

  return (
    <SectionRegistry sections={sectionsWithData} />
  );
}
