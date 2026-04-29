import { ImageResponse } from 'next/og';
import { getWedding } from '@/lib/fetch-wedding';

export const runtime = 'edge';

export const alt = 'Wedding Invitation';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { weddingId: string } }) {
  const wedding = await getWedding(params.weddingId);

  if (!wedding || !wedding.ogImage) {
    // Fallback if no image is found
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fff5f5 0%, #fefcfb 100%)',
            fontSize: 48,
            color: '#9ca3af',
            fontFamily: 'sans-serif',
          }}
        >
          Wedding Invitation
        </div>
      ),
      { ...size }
    );
  }

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const imageUrl = wedding.ogImage.startsWith('http') 
    ? wedding.ogImage 
    : `${baseUrl}${wedding.ogImage}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    ),
    {
      ...size,
    }
  );
}
