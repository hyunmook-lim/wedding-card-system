# 모바일 청첩장 시스템 (Wedding Card System)

이 프로젝트는 **Next.js App Router + Component Registry** 패턴을 따르며, 동적 설정(Config-Driven) 기반의 모바일 청첩장 시스템을 제공합니다.

## 프로젝트 구조 (Project Structure)

### 📂 디렉토리 구조 상세 (Directory Overview)

```bash
src/
├── app/                  # Next.js App Router 디렉토리
│   ├── [weddingId]/      # 청첩장 동적 라우트 (Dynamic Route)
│   │   ├── page.tsx      # 서버 컴포넌트: 데이터 페칭 및 메타데이터 생성
│   │   └── layout.tsx    # 모바일 레이아웃 컨테이너
│   ├── api/              # 백엔드 API 라우트 (필요 시)
│   └── globals.css       # 전역 스타일 (Tailwind CSS)
│
├── components/           # React 컴포넌트
│   ├── sections/         # 개별 섹션 컴포넌트 (JSON type과 매핑됨)
│   │   ├── Intro/        # "intro" 타입 섹션
│   │   ├── Greeting/     # "greeting" 타입 섹션
│   │   ├── BrideGroom/   # "bride_groom" 타입 섹션
│   │   ├── Date/         # "date" 타입 섹션
│   │   ├── Location/     # "location" 타입 섹션
│   │   ├── Account/      # "account" 타입 섹션
│   │   └── Gallery/      # "gallery" 타입 섹션
│   ├── effects/          # 전역 시각 효과 (눈 내림, 배경음악 등)
│   ├── ui/               # 재사용 UI 컴포넌트 (버튼, 모달 등)
│   └── SectionRegistry.tsx # [Client] JSON 설정을 React 컴포넌트로 매핑하는 레지스트리
│
├── lib/                  # 유틸리티 및 비즈니스 로직
│   ├── fetch-wedding.ts  # 데이터 조회(Fetching) 로직
│   └── utils.ts          # 헬퍼 함수
│
└── types/                # TypeScript 타입 정의
    └── wedding.d.ts      # WeddingConfig, SectionProps 등 인터페이스 정의
```

### 🏗️ 아키텍처 및 구현 현황 (Architecture & Status)

1.  **동적 렌더링 (Dynamic Rendering)**:

    - `src/app/[weddingId]/page.tsx`에서 URL 파라미터를 기반으로 설정 데이터를 조회합니다.
    - `SectionRegistry.tsx`가 설정 데이터를 순회하며 적절한 섹션 컴포넌트를 동적으로 임포트하여 렌더링합니다.

2.  **컴포넌트 레지스트리 (Component Registry)**:

    - 위치: `src/components/SectionRegistry.tsx`
    - 현재 지원 섹션: `Greeting`, `Intro`, `BrideGroom`, `Date`, `Location`, `Account`, `Gallery`
    - `next/dynamic`을 사용하여 컴포넌트를 지연 로딩(Lazy Loading)함으로써 성능을 최적화합니다.

3.  **현재 구현 상태 및 노트 (Current Status)**:
    - **구현 완료**: 핵심 섹션 매핑, 동적 라우팅, 기본 타입 정의(`wedding.d.ts`)
    - **구현 예정/미구현**:
      - `src/components/effects/`: 현재 비어 있음 (`EffectsLayer`, `SnowEffect` 등 구현 필요)
      - `src/components/ui/`: 현재 비어 있음
      - `src/app/[weddingId]/opengraph-image.tsx`: 소셜 공유 썸네일 생성 기능 미구현
    - **스타일링**: `app` 디렉토리의 `globals.css`와 Tailwind CSS 설정 완료
