import { WeddingConfig } from '@/types/wedding';

const MOCK_DB: Record<string, WeddingConfig> = {
  'default': {
    id: 'default',
    couple: {
      groom: {
        name: '임현묵',
        relation: '장남',
        parents: { father: '임아버지', mother: '김어머니' },
        contact: '010-1234-5678'
      },
      bride: {
        name: '김신부',
        relation: '장녀',
        parents: { father: '김아빠', mother: '이엄마' },
        contact: '010-8765-4321'
      }
    },
    event: {
      date: '2025-05-24T12:00:00',
      location: {
        name: '서울 웨딩홀',
        address: '서울시 강남구 테헤란로 123',
        lat: 37.5,
        lng: 127.0,
        mapUrl: 'https://naver.me/placeholder'
      }
    },
    sections: [
      {
        id: 'sec_1',
        type: 'intro', // Cover Photo
        variant: 'basic',
        isVisible: true,
        content: {
          title: 'We Are Getting Married',
          mainImage: '' // empty for placeholder
        }
      },
      {
        id: 'sec_2',
        type: 'greeting',
        variant: 'basic',
        isVisible: true,
        content: {
          title: '소중한 분들을 초대합니다',
          message: '저희 두 사람의 새로운 시작을\n함께 축복해 주시면 감사하겠습니다.',
        }
      },
      {
        id: 'sec_3',
        type: 'bride_groom', // Intro -> BrideGroom
        variant: 'basic',
        isVisible: true,
        content: {}
      },
      {
        id: 'sec_4',
        type: 'date',
        variant: 'basic',
        isVisible: true,
        content: {
          // date injected from global event
        }
      },
      {
        id: 'sec_5',
        type: 'location',
        variant: 'basic',
        isVisible: true,
        content: {
          // location injected from global event
        }
      },
       {
        id: 'sec_6',
        type: 'account',
        variant: 'basic',
        isVisible: true,
        content: {
          accounts: [
            { bank: '신한은행', account: '110-333-444444', name: '임현묵' }
          ]
        }
      },
      {
        id: 'sec_7',
        type: 'gallery',
        variant: 'basic',
        isVisible: true,
        content: {
          images: []
        }
      }
    ]
  }
};

export async function getWedding(weddingId: string): Promise<WeddingConfig | null> {
  // Simulate DB delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_DB[weddingId] || MOCK_DB['default'];
}
