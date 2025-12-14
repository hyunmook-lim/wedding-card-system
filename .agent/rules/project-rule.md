---
trigger: always_on
---

📋 Project Rules: Interactive Mobile Wedding Card

1. 프로젝트 개요 및 핵심 원칙
   Goal: 단순 텍스트 나열이 아닌, AR/3D 등 인터랙티브한 경험을 제공하는 모바일 청첩장 서비스.

Architecture Pattern: Single Codebase, Dynamic Rendering.

고객별로 정적 사이트를 빌드하지 않는다.

하나의 Next.js 애플리케이션이 URL 파라미터(weddingId)를 통해 DB의 설정(JSON)을 읽어 동적으로 렌더링한다.

Core Tech Stack:

Framework: Next.js 14+ (App Router)

Language: TypeScript (Strict Mode)

Styling: Tailwind CSS (권장) + CSS Modules

Animation/3D: Framer Motion, Three.js (@react-three/fiber)

Deployment: Vercel

2. 프로젝트 구조 (Project Structure)
   Next.js App Router의 장점(SSR, Metadata)과 Component Registry 패턴을 결합한 구조를 준수한다.

Bash

src/
├── app/ # Next.js App Router
│ ├── [weddingId]/ # 동적 라우트 (예: /w/Ab3d9X)
│ │ ├── page.tsx # [Server] 메인 뷰어, 데이터 페칭, 메타데이터 생성
│ │ ├── layout.tsx # [Server] 모바일 컨테이너 및 공통 레이아웃
│ │ └── opengraph-image.tsx # [Server] 공유 썸네일 동적 생성
│ ├── api/ # [Server] 백엔드 API Routes
│ └── layout.tsx # Global Root Layout
│
├── components/
│ ├── sections/ # 청첩장 개별 섹션 (JSON type과 매핑)
│ │ ├── Intro/ # (예: type="intro")
│ │ │ ├── BasicIntro.tsx # (variant="basic")
│ │ │ └── ThreeDIntro.tsx # (variant="3d")
│ │ ├── Gallery/
│ │ └── ...
│ ├── effects/ # 전역 효과 및 인터랙션 레이어
│ │ ├── EffectsLayer.tsx # z-index로 텍스트 위에 띄우는 효과 컨테이너
│ │ ├── SnowEffect.tsx
│ │ └── BGMPlayer.tsx
│ ├── ui/ # 재사용 가능한 UI 컴포넌트 (Buttons, Modals)
│ └── SectionRegistry.tsx # ★ [Client] JSON 설정 <-> 컴포넌트 매핑 핵심 로직
│
├── lib/ # 비즈니스 로직 및 유틸리티
│ ├── fetch-wedding.ts # DB 데이터 조회 함수
│ └── utils.ts
│
├── types/ # TypeScript 타입 정의
│ └── wedding.d.ts # WeddingConfig, SectionProps 등 스키마 정의
│
└── styles/
└── globals.css 3. 소스코드 및 구현 규칙 (Implementation Rules)
3.1. 렌더링 전략 (SSR vs CSR)
page.tsx (Server Component):

DB 접근 및 데이터 페칭은 반드시 여기서 수행한다.

generateMetadata 함수를 사용하여 카카오톡/문자 공유 시 보여질 Open Graph 태그(제목, 설명, 썸네일)를 완성해서 보낸다.

SectionRegistry.tsx (Client Component):

서버에서 받은 데이터를 기반으로 실제 화면을 그린다.

무거운 컴포넌트(3D, 차트 등)는 next/dynamic을 사용하여 지연 로딩(Lazy Loading)한다.

3.2. 데이터 및 리소스 관리
Config Driven UI:

모든 화면 구성은 DB의 JSON 데이터(WeddingConfig)에 의해 결정된다. 하드코딩을 금지한다.

Asset Handling:

이미지, 비디오 등 고용량 파일은 프로젝트 내부에 포함시키지 않는다.

AWS S3, Cloudinary 등 외부 스토리지에 업로드 후 URL만 JSON에 저장한다.

렌더링 시 Next.js의 <Image /> 컴포넌트를 사용하여 자동 최적화(WebP 변환, 리사이징)를 적용한다.

3.3. 컴포넌트 작성 규칙
인터페이스 준수: 모든 섹션 컴포넌트는 SectionProps 타입을 상속받아야 한다.

TypeScript

interface SectionProps {
variant: string;
config: Record<string, any>; // 각 컴포넌트별 세부 설정
isVisible: boolean;
}
방어적 코드: config 내의 필드(이미지 URL, 텍스트 등)가 비어있을 경우를 대비하여 Optional Chaining(?.)과 Default Value를 반드시 설정한다.

4. 디자인 및 UX 가이드 (Design Rules)
   4.1. 모바일 최적화 (Mobile First)
   모든 디자인은 모바일 뷰(width: 100%, max-width: 430px)를 기준으로 한다.

데스크탑 접근 시, 중앙에 모바일 형태의 컨테이너를 배치하고 배경은 블러 처리하거나 단색으로 마감하여 집중도를 높인다.

4.2. 인터랙션 및 성능
레이어 분리: 텍스트 정보와 무거운 3D/Canvas 효과는 DOM 레벨에서 분리한다. (예: absolute 포지션의 EffectsLayer가 배경에 위치)

스크롤 경험: 긴 청첩장의 특성상, 스크롤에 따른 페이드인(Fade-in) 등의 트리거 애니메이션(framer-motion)을 적극 활용한다.

5. 보안 및 배포 (Security & Deployment)
   5.1. URL 및 접근 제어
   Randomized URL: 순차적 ID(예: /1, /2) 사용 금지. 예측 불가능한 NanoID 또는 UUID를 사용한다. (예: /w/K9zX2a)

Robots.txt: 개인정보 보호를 위해 검색 엔진 봇의 접근을 차단한다 (index: false, follow: false).

5.2. 배포 환경
Platform: Vercel (Next.js 최적화)

Environment Variables: DB 접속 정보나 API 키는 반드시 .env 파일로 관리하며, 클라이언트(브라우저)에 노출되지 않도록 주의한다 (NEXT*PUBLIC* 접두사 주의).
