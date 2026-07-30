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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://anotherwedding.vercel.app';
  const ogImageUrl = wedding.ogImage ? `${baseUrl}${wedding.ogImage}` : `${baseUrl}/test-resources/openimage.webp`;

  return {
    title: `${wedding.couple.groom.name} & ${wedding.couple.bride.name}의 결혼식`,
    description: `${wedding.event.location.name}에서 열리는 아름다운 예식에 초대합니다.`,
    openGraph: {
      title: `${wedding.couple.groom.name} & ${wedding.couple.bride.name}의 결혼식`,
      description: `${wedding.event.location.name}에서 열리는 아름다운 예식에 초대합니다.`,
      url: `${baseUrl}/${weddingId}`,
      siteName: 'Interactive Wedding Card',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${wedding.couple.groom.name} & ${wedding.couple.bride.name}의 결혼식`,
      description: `${wedding.event.location.name}에서 열리는 아름다운 예식에 초대합니다.`,
      images: [ogImageUrl],
    },
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
          date: wedding.event.date,
          groom: wedding.couple.groom.name,
          bride: wedding.couple.bride.name
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
    if (section.type === 'intro') {
      return {
        ...section,
        content: {
          ...section.content,
          groom: wedding.couple.groom.name,
          bride: wedding.couple.bride.name
        }
      };
    }
    return section;
  });

  return (
    <SectionRegistry wedding={{ ...wedding, sections: sectionsWithData }} />
  );
}
