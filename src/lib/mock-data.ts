import { WeddingConfig } from '@/types/wedding';

export const MOCK_DB: Record<string, WeddingConfig> = {
  'default': {
    id: 'default',
    couple: {
      groom: {
        name: '유영후',
        relation: '아들',
        parents: { father: '유정호', mother: '오현미' },
        contact: '010-1234-5678'
      },
      bride: {
        name: '임예은',
        relation: '딸',
        parents: { father: '임재용', mother: '허미영' },
        contact: '010-8765-4321'
      }
    },
    event: {
      date: '2026-07-25T11:00:00',
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
          mainImage: '', // empty for placeholder
          introVideo: '/test-resources/intro/intro-video.mp4',
          background: { type: 'none' }
        }
      },
      {
        id: 'sec_2',
        type: 'greeting',
        variant: 'basic',
        isVisible: false,
        content: {
          title: '소중한 분들을 초대합니다',
          message: '저희 두 사람의 새로운 시작을\n함께 축복해 주시면 감사하겠습니다.',
        }
      },
      {
        id: 'sec_greeting_video',
        type: 'greeting',
        variant: 'video',
        isVisible: true,
        content: {
          title: 'Video Greeting',
          message: 'Scroll to play video',
          images: Array.from({ length: 100 }, (_, i) => `/test-resources/123_frames/123_${String(i + 1).padStart(3, '0')}.png`),
          background: { type: 'none' }
        }
      },
      {
        id: 'sec_3',
        type: 'bride_groom',
        variant: 'card',
        isVisible: false,
        content: {
          background: { type: 'none' } 
        }
      },
      {
        id: 'sec_trendy_bg',
        type: 'bride_groom',
        variant: 'trendy',
        isVisible: true,
        content: {
          isSticky: false,
          background: { type: 'none' }
        }
      },
      {
        id: 'sec_memories',
        type: 'memories',
        variant: 'glass',
        isVisible: true,
        content: {
          isSticky: false,
          background: { type: 'none' }
        }
      },
      {
        id: 'sec_4',
        type: 'date',
        variant: 'glass',
        isVisible: true,
        content: {
          isSticky: false,
          date: '2026-07-25T11:00:00', // injected from global event usually, but explicit here for clarity
          background: { type: 'none' }
        }
      },
      {
        id: 'sec_5',
        type: 'location',
        variant: 'glass',
        isVisible: true,
        content: {
          isSticky: false,
          background: { type: 'none' }
          // location injected from global event
        }
      },
       {
        id: 'sec_6',
        type: 'account',
        variant: 'masked',
        isVisible: true,
        content: {
          isSticky: false,
          background: { type: 'none' }, 
          accounts: [
            { bank: '신한은행', account: '110-333-444444', name: '임현묵' }
          ]
        }
      },
      {
        id: 'sec_7',
        type: 'gallery',
        variant: 'basic',
        isVisible: false,
        content: {
          background: { type: 'color', value: '#FF00FF' }, // Magenta
          images: []
        }
      },
      {
        id: 'sec_8',
        type: 'gallery',
        variant: 'album',
        isVisible: true,
        content: {
          background: { type: 'none' },
          images: [] // 20 test images will be used by default
        }
      },
    ]
  }
};
