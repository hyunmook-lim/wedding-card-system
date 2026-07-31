# Wedding Card System Agent Guide

## 1. 문서 목적

이 문서는 이 저장소에서 작업하는 개발자와 AI 에이전트가 프로젝트의 현재 구조와 동작을 동일하게 이해하기 위한 안내서다.

프로젝트에서 수정하거나 추가할 작업은 루트의 `TODO.md`에서 관리한다. 이 문서에는 현재 구현을 설명하는 내용만 기록한다.

## 2. 프로젝트 개요

- 프레임워크: Next.js 16 App Router
- UI: React 19, TypeScript, Tailwind CSS
- 애니메이션: Framer Motion
- 3D/AR: Three.js, React Three Fiber, React Three Drei
- 주요 화면: 모바일 세로형 청첩장
- 청첩장 컨테이너 최대 너비: 430px
- 렌더링 방식: URL 기반 데이터 조회 + 설정 기반 섹션 렌더링
- 현재 데이터 소스: `src/lib/mock-data.ts`의 로컬 `MOCK_DB`
- 현재 미디어 위치: 대부분 `public/test-resources`와 `public/bg`

이 프로젝트는 URL의 `weddingId`를 이용해 `WeddingConfig`를 조회하고, 설정된 섹션 순서와 디자인 variant에 따라 모바일 청첩장을 표시한다.

## 3. 현재 핵심 구조

현재 청첩장 화면의 중심 흐름은 다음과 같다.

```text
WeddingConfig
    -> SectionRegistry
        -> SectionConfig.type + SectionConfig.variant
            -> Section Component
```

결혼식별 정보는 `WeddingConfig`에 들어 있다. 화면의 섹션 순서, 노출 여부, 디자인, 텍스트와 미디어도 `sections` 배열에 들어 있다.

결혼식마다 별도의 페이지 컴포넌트가 있는 구조가 아니라, 하나의 동적 페이지가 URL별 설정 데이터를 받아 렌더링하는 구조다.

## 4. 현재 URL 구조

### `/`

`src/app/page.tsx`가 `/younghoo_yeeun`으로 리다이렉트한다.

```tsx
redirect('/younghoo_yeeun');
```

### `/{weddingId}`

실제 청첩장 동적 라우트다.

1. `src/app/[weddingId]/page.tsx`가 URL 파라미터에서 `weddingId`를 추출한다.
2. `getWedding(weddingId)`로 데이터를 조회한다.
3. 공통 데이터를 일부 섹션의 `content`에 병합한다.
4. 최종 `WeddingConfig`를 `SectionRegistry`에 전달한다.
5. `SectionRegistry`가 섹션을 순서대로 렌더링한다.

### `/{weddingId}/opengraph-image`

`src/app/[weddingId]/opengraph-image.tsx`가 결혼식 데이터의 `ogImage`를 이용해 1200×630 PNG 응답을 생성한다.

`ogImage`가 없으면 텍스트가 있는 기본 이미지를 생성한다.

### `/manual-test`

Typography, Button, Fade 효과를 확인하는 개발용 정적 페이지다. 결혼식 데이터를 조회하지 않는다.

### `/manual-test/glass`

Liquid Glass UI를 확인하는 개발용 정적 페이지다. 컴포넌트에 선언된 외부 배경 이미지 목록을 사용하며 결혼식 데이터를 조회하지 않는다.

정적 테스트 라우트는 동적 `[weddingId]` 라우트보다 우선한다.

## 5. 현재 요청 및 렌더링 흐름

```text
GET /{weddingId}
        |
        v
src/app/[weddingId]/page.tsx
        |
        v
getWedding(weddingId)
        |
        v
MOCK_DB[weddingId] 또는 null
        |
        v
공통 데이터를 section.content에 병합
        |
        v
SectionRegistry
        |
        +--> Intro overlay
        |
        +--> isVisible인 일반 섹션
                |
                +--> StickySection
                        |
                        +--> BackgroundRenderer
                        +--> Section Component
```

## 6. 레이아웃 구조

### Root layout

`src/app/layout.tsx`는 모든 URL에 적용된다.

- Geist, Geist Mono, Noto Serif KR, Pacifico 폰트를 등록한다.
- `globals.css`를 로드한다.
- `KakaoInit`을 렌더링한다.
- `ImageProtector`를 렌더링한다.
- 카카오 JavaScript SDK 2.7.0 스크립트를 `afterInteractive`로 로드한다.

### Wedding layout

`src/app/[weddingId]/layout.tsx`는 청첩장 URL에 적용된다.

- 전체 화면 배경은 `bg-neutral-100`이다.
- 청첩장 콘텐츠 너비를 최대 430px로 제한한다.
- 가운데 정렬과 그림자를 적용한다.
- `FloatingActions`에 현재 `weddingId`를 전달한다.
- `FloatingActions`는 BGM 버튼과 카카오 공유 버튼을 표시한다.

## 7. 핵심 파일

```text
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── [weddingId]/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── opengraph-image.tsx
│   └── manual-test/
├── components/
│   ├── SectionRegistry.tsx
│   ├── sections/
│   ├── backgrounds/
│   ├── effects/
│   ├── dev/
│   └── ui/
├── hooks/
├── lib/
│   ├── fetch-wedding.ts
│   ├── mock-data.ts
│   ├── preloaded-media-context.tsx
│   └── utils.ts
├── types/
│   └── wedding.d.ts
└── public/
    ├── bg/
    └── test-resources/
```

## 8. 현재 데이터 조회

`src/lib/fetch-wedding.ts`의 `getWedding()`이 데이터 조회 함수다.

```ts
export async function getWedding(
  weddingId: string,
): Promise<WeddingConfig | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_DB[weddingId] || MOCK_DB['younghoo_yeeun'];
}
```

현재 동작은 다음과 같다.

- 실제 DB 또는 외부 API를 호출하지 않는다.
- 데이터 조회를 흉내 내기 위해 100ms를 기다린다.
- `MOCK_DB[weddingId]`가 있으면 해당 데이터를 반환한다.
- 해당 ID가 없으면 `null`을 반환한다.
- 현재 `MOCK_DB`에는 `younghoo_yeeun` 한 건이 등록되어 있다.

`generateMetadata()`와 청첩장 페이지는 각각 `getWedding()`을 호출한다. `ShareButton`도 브라우저의 `useEffect`에서 같은 함수를 다시 호출한다.

## 9. WeddingConfig

현재 최상위 타입은 `src/types/wedding.d.ts`의 `WeddingConfig`다.

```text
WeddingConfig
├── id
├── couple
│   ├── groom
│   │   ├── name
│   │   ├── relation
│   │   ├── parents
│   │   └── contact?
│   └── bride
│       ├── name
│       ├── relation
│       ├── parents
│       └── contact?
├── event
│   ├── date
│   └── location
│       ├── name
│       ├── address
│       ├── lat
│       ├── lng
│       └── mapUrl?
├── sections[]
└── ogImage?
```

각 섹션은 다음 구조를 사용한다.

```ts
interface SectionConfig {
  id: string;
  type: SectionType;
  variant: string;
  isVisible: boolean;
  content: {
    background?: BackgroundConfig;
    [key: string]: unknown;
  };
}
```

현재 `SectionType`에는 다음 값이 선언되어 있다.

```text
greeting
intro
bride_groom
date
location
account
gallery
guestbook
share
ar_viewer
memories
liquid_glass
```

`guestbook`, `share`, `liquid_glass`는 타입에는 포함되어 있지만 현재 `SECTION_COMPONENTS`에는 매핑되어 있지 않다.

## 10. 공통 데이터 병합

`src/app/[weddingId]/page.tsx`는 조회한 공통 데이터를 다음 섹션의 `content`에 병합한다.

| 섹션 타입 | 병합하는 데이터 |
| --- | --- |
| `intro` | 신랑·신부 이름 |
| `bride_groom` | 신랑·신부 전체 객체 |
| `date` | 예식 날짜, 신랑·신부 이름 |
| `location` | 예식장 전체 객체 |

전역 `event.date`와 섹션의 `content.date`가 모두 있으면 병합 과정에서 `event.date`가 최종 값이 된다.

다른 섹션은 `mock-data.ts`에 선언된 `content`를 그대로 사용한다.

## 11. SectionRegistry

`src/components/SectionRegistry.tsx`는 클라이언트 컴포넌트다.

현재 `SECTION_COMPONENTS` 매핑은 다음과 같다.

| Type | Variant | Component |
| --- | --- | --- |
| `intro` | `basic` | `BasicIntro` |
| `intro` | `video` | `MainIntro` |
| `greeting` | `basic` | `BasicGreeting` |
| `greeting` | `video` | `VideoGreeting` |
| `greeting` | `video2` | `VideoGreeting2` |
| `greeting` | `polaroid` | `PolaroidGreeting` |
| `greeting` | `polaroid2` | `PolaroidGreeting2` |
| `bride_groom` | `basic` | `BasicBrideGroom` |
| `bride_groom` | `card` | `CardBrideGroom` |
| `bride_groom` | `trendy` | `TrendyTextBrideGroom` |
| `date` | `basic` | `BasicDate` |
| `date` | `typing` | `TypingDate` |
| `date` | `soft` | `SoftTypingDate` |
| `date` | `flipboard` | `FlipBoardDate` |
| `date` | `calendar` | `NewmorphismCalendar` |
| `date` | `glass` | `GlassmorphismCalendar` |
| `location` | `basic` | `BasicLocation` |
| `location` | `memo` | `NewmorphismLocation` |
| `location` | `glass` | `GlassmorphismLocation` |
| `account` | `basic` | `BasicAccount` |
| `account` | `masked` | `GlassmorphismAccount` |
| `gallery` | `basic` | `FlyingGallery` |
| `gallery` | `flying` | `FlyingGallery` |
| `gallery` | `grid` | `BasicGallery` |
| `gallery` | `album` | `AlbumGallery` |
| `ar_viewer` | `basic` | `ARViewer` |
| `ar_viewer` | `card_scan` | `ARCardScan` |
| `memories` | `glass` | `GlassmorphismMemories` |

variant에 해당하는 컴포넌트가 없으면 같은 type의 `basic` variant를 찾는다. type 자체가 없거나 최종 컴포넌트를 찾지 못하면 해당 섹션을 렌더링하지 않는다.

모든 섹션 컴포넌트는 현재 파일 상단에서 정적으로 import된다.

## 12. Intro 동작

`SectionRegistry`의 초기 상태는 다음과 같다.

```ts
showIntro = true
isPreloading = true
loadingProgress = 0
```

intro 섹션은 일반 섹션과 분리되어 overlay로 표시된다.

- intro가 표시되는 동안 `document.body.style.overflow`를 `hidden`으로 설정한다.
- intro variant가 `video`이면 프리로딩 완료 1.5초 후 overlay를 닫는다.
- 그 외 intro는 프리로딩 완료 6초 후 overlay를 닫는다.
- `onEnter` 콜백도 `showIntro`를 `false`로 변경한다.
- overlay exit animation 시간은 1.2초다.
- exit가 끝나면 `introFadedOut` context 값이 `true`가 된다.
- 일반 콘텐츠와 `AdaptiveBackground`는 intro가 닫힌 후 렌더링된다.

intro 섹션은 `sections.find(section.type === 'intro')`로 첫 번째 항목을 찾는다.

## 13. 일반 섹션 동작

intro가 아닌 섹션 중 `isVisible`이 `true`인 항목만 화면에 표시된다.

각 섹션은 다음 구조로 렌더링된다.

```text
SectionDebugWrapper
└── wrapper div
    └── StickySection
        ├── BackgroundRenderer
        └── Section Component
```

`content.isSticky !== false`이면 sticky 섹션이다.

- sticky 섹션의 외부 컨테이너는 variant별 높이를 가진다.
- 내부 컨테이너는 `sticky top-0 h-[100svh]`다.
- `isSticky: false`이면 별도의 고정 높이 없이 일반 `relative` 컨테이너를 사용한다.
- 마지막 visible 섹션은 지정된 variant 높이나 `100dvh`를 사용한다.
- 그 외 섹션은 지정된 variant 높이나 기본 `800px`을 사용한다.

`sec_memories` ID를 가진 wrapper의 ref는 `AdaptiveBackground`의 fade-in 진행도를 계산하는 기준으로 전달된다.

## 14. 배경과 효과

`StickySection` 내부의 레이어 순서는 다음과 같다.

```text
StickySection
├── BackgroundRenderer: z-0
│   ├── 단색, 이미지 또는 커스텀 컴포넌트
│   └── EffectsRenderer
└── Section Component: z-10
```

현재 `BackgroundRenderer`가 처리하는 설정은 다음과 같다.

- `type: color`: `SolidColorBackground`
- `type: image`: `ImageBackground`
- `type: component`: 등록된 커스텀 배경 컴포넌트
- `type: none`: 기본 배경 콘텐츠 없음

현재 등록된 커스텀 배경은 `CardSpreadBackground`다.

현재 등록된 effect는 `snow`이며 `SnowEffect`를 렌더링한다.

`AdaptiveBackground`는 intro가 닫힌 후 고정된 `/bg/silk-bg-fixed-dark.webp`를 표시한다. `sec_memories`가 viewport에 진입하는 진행도에 따라 opacity가 증가하고 페이지 끝까지 유지된다.

## 15. 현재 목업 청첩장

현재 `MOCK_DB`에는 `younghoo_yeeun` 한 건이 있다.

기본 정보는 다음과 같다.

- 신랑: 유영후
- 신부: 임예은
- 예식일: 2026-07-25 11:30
- 장소: 토브헤세드
- 주소: 서울 강남구 도산대로38길 32
- OG 이미지: `/test-resources/openimage.webp`

현재 표시되는 섹션 순서는 다음과 같다.

| 순서 | Type | Variant | 주요 콘텐츠 |
| ---: | --- | --- | --- |
| 1 | `intro` | `video` | 인트로 프레임과 신랑·신부 이름 |
| 2 | `greeting` | `video2` | 비디오 프레임 |
| 3 | `bride_groom` | `trendy` | 신랑·신부 이미지 |
| 4 | `memories` | `glass` | 연애 타임라인 4개 |
| 5 | `date` | `glass` | 예식 날짜 |
| 6 | `location` | `glass` | 장소, 교통, 카페 안내 |
| 7 | `account` | `masked` | 신랑·신부 측 계좌 |
| 8 | `gallery` | `album` | 갤러리 이미지 33장 |

`isVisible: false`인 섹션은 다음과 같다.

- `greeting/basic`
- `greeting/polaroid2`
- `bride_groom/card`
- `gallery/basic`

## 16. 현재 미디어 구성

현재 결혼식용 미디어는 주로 `public/test-resources` 아래에 저장되어 있다.

```text
public/test-resources/
├── intro/          45개의 WebP frame
├── video/          74개의 WebP frame
├── bride-groom/    신랑·신부 이미지
├── memories/       타임라인 이미지
├── location/       교통 아이콘과 장소 이미지
├── gallery/        갤러리 이미지
├── gallery2/       현재 album gallery 이미지 33장
├── ar/             AR target 및 영상
├── bgm.mp3
└── openimage.webp
```

현재 운영 중 업로드되는 미디어를 위한 Object Storage, CDN, 이미지 변환 파이프라인은 구현되어 있지 않다.

## 17. 현재 프리로딩 동작

`SectionRegistry`의 `useEffect`가 현재 프리로딩을 담당한다.

### Priority task

- `GowunDodum` 폰트
- intro variant가 `video`인 경우 `/test-resources/intro/frame_0001.webp`부터 `frame_0045.webp`
- intro content에 `introVideo`가 있으면 해당 영상

Priority task 전체가 끝난 300ms 후 `isPreloading`은 `false`가 된다.

### 섹션 선행 로딩

intro가 닫힌 후 스크롤 위치를 기준으로 현재 섹션과 진행 방향의 다음 섹션을 선행 로딩한다.

- 일반 스크롤: 현재 섹션과 다음 2개 섹션
- 빠른 스크롤: 현재 섹션과 다음 3개 섹션
- visible section의 `content`를 재귀적으로 순회해 이미지, 영상, 음원 URL을 찾는다.
- `video2` greeting은 74개 프레임을 해당 섹션의 미디어로 취급한다.
- gallery 설정 이미지의 선행 로딩 대상은 처음 6장이다.
- URL별 Promise를 재사용해 같은 자원을 중복 요청하지 않는다.
- 동시에 실행되는 미디어 요청은 최대 4개다.
- 대기 중인 요청은 현재 섹션에 가까운 자원을 우선하도록 우선순위를 갱신한다.

비디오 자원은 `preloadedMediaRef`의 `Map<string, HTMLVideoElement>`에 저장된다. 이미지와 음원은 로드 완료 여부만 추적한다.

## 18. 현재 이미지 표시 방식

프로젝트에는 `next/image`와 일반 브라우저 `Image` 객체가 함께 사용된다.

- 화면 렌더링 컴포넌트 중 일부는 `next/image`를 사용한다.
- 프리로딩은 `new window.Image()`를 사용한다.
- 동적 이미지 URL을 위한 `next.config.ts`의 `images.remotePatterns` 설정은 현재 없다.
- 목업 이미지가 로컬 경로이므로 현재 주요 청첩장에서는 `/test-resources/...` 경로를 사용한다.
- `WeddingConfig`에는 이미지의 원본 크기, 변환본, blur placeholder를 표현하는 공통 타입이 없다.

## 19. 현재 영상 및 음원 동작

### 프레임 애니메이션

- `MainIntro`는 `/test-resources/intro` 프레임을 사용한다.
- `VideoGreeting2`용 프리로더는 `/test-resources/video` 프레임 74개를 요청한다.

### BGM

`BGMPlayer`는 결혼식 설정이 아니라 고정된 `/test-resources/bgm.mp3`를 사용한다.

- `loop`와 `preload="auto"`가 설정되어 있다.
- mount 후 `audio.play()`를 호출한다.
- 자동재생이 성공하면 재생 상태를 표시한다.
- 자동재생이 거부되면 정지 상태를 표시한다.
- 사용자가 버튼을 눌러 재생과 정지를 전환할 수 있다.

## 20. 메타데이터와 공유

### 페이지 메타데이터

`src/app/[weddingId]/page.tsx`의 `generateMetadata()`는 다음 값을 사용한다.

- 제목: 신랑 이름과 신부 이름
- 설명: 예식장 이름
- URL: `NEXT_PUBLIC_BASE_URL`과 `weddingId`
- OG 이미지: `wedding.ogImage`
- locale: `ko_KR`
- type: `website`
- Twitter card: `summary_large_image`

`NEXT_PUBLIC_BASE_URL`이 없으면 `https://anotherwedding.vercel.app`을 사용한다.

### 동적 Open Graph 이미지

`src/app/[weddingId]/opengraph-image.tsx`는 `VERCEL_URL`이 있으면 이를 사용하고, 없으면 `http://localhost:3000`을 사용해 `ogImage`의 절대 URL을 만든다.

### 카카오 공유

`ShareButton`은 mount 후 `getWedding(weddingId)`을 호출해 상태에 저장한다.

공유 버튼을 누르면 다음 데이터를 카카오 SDK에 전달한다.

- 신랑·신부 이름
- 예식장 주소와 이름
- 예식 날짜와 시간
- OG 이미지
- 현재 청첩장 URL

카카오 공유의 base URL은 metadata와 동일하게 `NEXT_PUBLIC_BASE_URL` 또는 `https://anotherwedding.vercel.app`을 사용한다.

## 21. 모바일 청첩장 도메인 특성

이 프로젝트가 다루는 모바일 청첩장은 다음 특성을 가진다.

- 링크 공유를 통해 처음 방문하는 사용자가 대부분이다.
- 사용자는 로그인하지 않고 공개 URL로 접근한다.
- 모바일 네트워크와 카카오톡 인앱 브라우저 사용 비율이 높다.
- 최대 430px의 세로 화면을 중심으로 구성된다.
- 세로 스크롤과 sticky animation의 비중이 높다.
- 갤러리, 인트로, 영상 때문에 전체 미디어 용량이 커질 수 있다.
- 첫 화면의 이미지와 애니메이션이 콘텐츠 인상에 큰 영향을 준다.
- 계좌번호, 전화번호, 가족 이름 등 개인정보가 포함된다.
- 카카오 공유 메시지와 Open Graph 미리보기가 주요 진입점으로 사용된다.
- 브라우저 정책에 따라 BGM 자동재생이 실패할 수 있다.
- 이미지 저장 방지를 위한 전역 `ImageProtector`가 적용되어 있다.

## 22. 개발 명령어

```bash
npm run dev
npm run dev:https
npm run lint
npm run build
npm run start
```

AR 또는 카메라 기능을 로컬 모바일 기기에서 확인할 때 HTTPS 개발 서버를 사용할 수 있다.

## 23. 관련 작업 목록

현재 구현에서 수정하거나 추가할 항목은 루트의 `TODO.md`를 참조한다.
