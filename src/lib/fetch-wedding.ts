import { WeddingConfig } from '@/types/wedding';

import { MOCK_DB } from './mock-data';

export async function getWedding(weddingId: string): Promise<WeddingConfig | null> {
  // Simulate DB delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_DB[weddingId] || MOCK_DB['default'];
}
