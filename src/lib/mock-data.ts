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
      date: '2026-07-25T11:30:00',
      location: {
        name: '토브헤세드',
        address: '서울시 강남구 논현동 123',
        lat: 37.5,
        lng: 127.0,
        mapUrl: 'https://naver.me/placeholder'
      }
    },
    sections: [
      {
        id: 'sec_1',
        type: 'intro',
        variant: 'video',
        isVisible: true,
        content: {
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
        variant: 'video2',
        isVisible: true,
        content: {
          src: '',
          background: { type: 'none' }
        }
      },
      {
        id: 'sec_greeting_polaroid',
        type: 'greeting',
        variant: 'polaroid2',
        isVisible: false,
        content: {
          images: [],
          captions: [],
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
          background: { type: 'none' },
          groomImage: '/test-resources/bride-groom/groom-full.webp',
          groomBgImage: '/test-resources/bride-groom/groom-background-full.webp',
          brideImage: '/test-resources/bride-groom/bride-full-changed.webp',
          brideBgImage: '/test-resources/bride-groom/bride-background.webp'
        }
      },
      {
        id: 'sec_memories',
        type: 'memories',
        variant: 'glass',
        isVisible: true,
        content: {
          isSticky: false,
          background: { type: 'none' },
          milestones: [
            { id: 'start', date: '2018년 05월 27일', title: '설레었던 우리의 시작', image: '/test-resources/memories/1.webp' },
            { id: 'period', date: '연애기간 2982일', title: '울고 웃었던\n8년간의 장거리 연애', image: '/test-resources/memories/2.webp' },
            { id: 'promise', date: '2025. 04. 12', title: 'Will you marry me?', image: '/test-resources/memories/3.webp' },
            { id: 'forever', date: '2026. 07. 25', title: '평생을 약속하는 오늘', image: '/test-resources/memories/4.webp' }
          ]
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
          background: { type: 'none' },
          transportation: [
            { title: "지하철", content: "학동역 10번 출구", icon: "/test-resources/location/subway.svg" },
            { title: "셔틀버스", content: "학동역 10번 출구 좌측에서 셔틀 대기", sub: "(10~15분 간격으로 탑승 가능 하시며,\n3분 정도 소요 됩니다.)", icon: "/test-resources/location/bus.svg" },
            { title: "자가용", content: "네비게이션 '토브헤세드' 검색", sub: "(주차 3시간 무료)\n만차 시 인근주차장 정보\n- 언주로147길 노상공영주차장(4,800원)\n- 연승빌딩주차장(3,000원)", icon: "/test-resources/location/car.svg" }
          ],
          hall_info: "저희의 예식은 두 곳의 복층 공간에서 진행됩니다.\n하객분들의 편의에 맞춰\n 편안한 자리를 선택해 주세요.\n\n1층 메인홀: 예식에 오롯이 집중하며 온전히 즐긴 후\n[h]예식이 끝난 후 식사[/h]를 하실 분들을 위한 장소입니다.\n\n2층 테라스홀: [h]예식과 식사를 동시[/h]에 편안하고\n여유롭게 즐기실 분들을 위한 자리입니다.",
          cafe_link: "https://naver.me/5If4L6J7",
          cafe_description: "더운 햇살이 내리쬐는 여름 날\n소중한 시간을 내어 와주신 하객분들을 위해\n\n식장 근처 [h]예쁘고 맛있는 카페들[/h]을\n공유합니다.",
          hospitality_message: "아끼는 마음들을 모아\n함께하는 발걸음마다 축복을 더해주시는\n모든 분들께 감사의 인사를 전합니다."
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
          description: "참석이 어려우신 분들을 위해\n계좌번호를 기재하였습니다.\n너그러운 마음으로 양해 부탁드립니다.",
          groom: [
            { relation: '신랑', name: '유영후', bank: '우리은행', accountNumber: '1002 747 550750' },
            { relation: '신랑 아버지', name: '유정호', bank: '국민은행', accountNumber: '286 21 0073 941' },
            { relation: '신랑 어머니', name: '오현미', bank: '국민은행', accountNumber: '655202 01 018442' }
          ],
          bride: [
            { relation: '신부', name: '임예은', bank: '우리은행', accountNumber: '1002 547 570441' },
            { relation: '신부 아버지', name: '임재용', bank: '신한은행', accountNumber: '110 164 865100' },
            { relation: '신부 어머니', name: '허미영', bank: '신한은행', accountNumber: '356 02 308641' }
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
          images: Array.from({ length: 33 }, (_, i) => `/test-resources/gallery/${i + 1}.webp`)
        }
      },
    ],
    ogImage: '/test-resources/openimage.webp',
  }
};
