# Wedding Card System TODO

이 문서는 `Agent.md`에 정리된 현재 구현을 기준으로 프로젝트에서 수정하거나 추가해야 할 작업을 관리한다.

체크박스는 실제 코드 수정과 검증이 완료된 뒤에만 체크한다.

## P0. 인프라 선택 및 초기 구성

- [ ] 기본 운영 조합 확정: Vercel + Neon PostgreSQL + Cloudflare R2
  - Next.js 애플리케이션은 현재 배포 환경인 Vercel을 유지한다.
  - 결혼식 설정, 공개 상태, 관리자 데이터는 Neon PostgreSQL에 저장한다.
  - 이미지, 영상, 음원 원본과 변환본은 Cloudflare R2에 저장한다.
  - 특정 공급자에 결합되지 않는 `WeddingConfig`와 asset 메타데이터 모델을 유지한다.
  - Cloudflare D1 + R2로 전환하는 경우에는 Next.js의 Cloudflare Workers 배포 및 런타임 호환성 검토를 별도 작업으로 진행한다.

- [ ] Neon 프로젝트와 PostgreSQL 연결 구성
  - 사용자와 가까운 사용 가능한 리전을 선택한다.
  - `DATABASE_URL` 등 연결 정보는 서버 환경 변수로만 관리한다.
  - Vercel 서버리스 환경에 맞는 pooled connection을 사용한다.
  - `weddings`, `wedding_assets` 및 필요 시 관리자·소유자 테이블의 migration을 작성한다.
  - 공개 조회에 필요한 `slug`, `status`, `published_at`, `expires_at` 인덱스를 추가한다.
  - Neon scale-to-zero 재시작 시에도 첫 청첩장 요청이 정상 동작하는지 확인한다.

- [ ] Cloudflare R2 버킷과 전달 도메인 구성
  - 개발·운영 버킷과 credential을 분리한다.
  - R2의 S3 호환 API를 사용하되 access key와 secret은 서버에만 둔다.
  - 공개 게시 미디어용 CDN/custom domain과 draft 미디어 접근 정책을 설정한다.
  - 브라우저 직접 업로드에 필요한 CORS origin, HTTP method, header를 최소 범위로 설정한다.
  - 업로드 객체 키에 `weddingId`, asset ID, content hash 또는 version을 포함한다.

- [ ] 인프라 사용량과 복구 정책 설정
  - Neon DB와 R2 저장소의 사용량 경고 기준을 설정한다.
  - 결혼식 데이터의 정기 DB dump 및 Storage 자산 백업 위치를 정한다.
  - 월별 방문 수, 평균 미디어 전송량, 캐시 적중률을 기록할 지표를 정의한다.
  - 실제 고객 공개 전에는 유료 플랜 전환 시점과 예산 한도를 정한다.

## P0. 데이터 정확성과 공개 범위

- [x] 존재하지 않는 `weddingId`에 기본 청첩장을 반환하는 fallback 제거
  - 대상: `src/lib/fetch-wedding.ts`
  - 없는 ID에는 `null`을 반환한다.
  - `src/app/[weddingId]/page.tsx`의 `notFound()` 동작을 확인한다.
  - metadata와 Open Graph 이미지도 없는 ID를 일관되게 처리한다.

- [ ] `getWedding()`을 실제 서버 전용 데이터 조회 계층으로 교체
  - `MOCK_DB`는 개발 fixture 또는 테스트 데이터로 한정한다.
  - 공개 URL에서는 `published` 상태인 결혼식만 조회한다.
  - `draft`, `archived`, 만료 상태의 동작을 정의한다.
  - DB 및 비밀 환경 변수에 접근하는 모듈을 클라이언트에서 import하지 못하게 한다.

- [ ] 결혼식 URL 식별자 정책 확정
  - `weddingId`와 `slug` 중 공개 URL 용어를 통일한다.
  - 허용 문자, 길이, 중복, 변경 정책을 정의한다.
  - 예약 경로인 `manual-test` 등과 충돌하지 않게 한다.

- [ ] DB에서 조회한 `WeddingConfig`에 런타임 스키마 검증 추가
  - Zod 등으로 top-level과 section별 content를 검증한다.
  - 필수값 누락과 잘못된 variant에 대한 오류 처리 또는 기본값 정책을 정의한다.
  - `schema_version`과 기존 데이터 마이그레이션 방법을 추가한다.

- [ ] 공개 페이지용 ViewModel 추가
  - 관리자 필드와 소유자 정보를 제외한다.
  - `isVisible: false`인 섹션을 서버에서 제외한다.
  - 숨겨진 계좌, 연락처, 미디어 URL이 RSC payload나 클라이언트 상태에 포함되지 않게 한다.

- [ ] `ShareButton`의 클라이언트 데이터 재조회 제거
  - 대상: `src/components/effects/ShareButton.tsx`
  - 서버 페이지 또는 wedding layout에서 공유에 필요한 공개 데이터만 props로 전달한다.
  - 실제 서버 전용 `getWedding()`을 클라이언트 컴포넌트가 import하지 않게 한다.

## P0. 초기 미디어 로딩

- [ ] `SectionRegistry`의 프리로드 task 중복 실행 제거
  - 대상: `src/components/SectionRegistry.tsx`
  - 진행률 계산과 `preloadedMedia` snapshot이 동일한 Promise 결과를 공유하게 한다.
  - 동일 URL에 대한 이미지, 영상, 음원 요청이 한 번만 생성되는지 Network 패널로 확인한다.

- [ ] 전체 미디어 완료를 기다리는 초기 진입 조건 제거
  - Critical 자원만 준비되면 intro를 표시한다.
  - 갤러리와 후반 섹션 로딩이 첫 화면 진입을 막지 않게 한다.
  - Critical, near-viewport, on-demand 세 단계의 로딩 상태를 구분한다.

- [ ] 프리로드 대상을 현재 결혼식 설정과 visible section 기준으로 수집
  - 사용하지 않는 `VideoGreeting2` 프레임을 모든 청첩장에서 로드하지 않는다.
  - `isVisible: false` 섹션의 미디어를 로드하지 않는다.
  - 실제 렌더링되는 variant가 선언한 미디어만 수집한다.

- [ ] 현재 섹션과 다음 섹션만 미리 로딩하는 스케줄러 구현
  - Intersection Observer 또는 scroll progress를 사용한다.
  - 현재/다음 섹션의 요청 우선순위를 높인다.
  - 이미 완료 또는 진행 중인 URL을 다시 요청하지 않는다.
  - 느린 네트워크에서 동시 요청 개수를 제한한다.

- [ ] 미디어 실패와 장시간 대기 fallback 추가
  - 이미지 실패 시 고정된 영역과 대체 UI를 표시한다.
  - 영상 실패 시 poster 이미지로 전환한다.
  - 특정 자원 하나의 실패가 전체 청첩장 진입을 막지 않게 한다.
  - 프리로드 timeout 정책을 정의한다.

## P0. 이미지 저장 및 CDN

- [ ] Cloudflare R2 Object Storage와 CDN 적용
  - Neon에는 결혼식 설정과 asset 메타데이터만 저장하고, 미디어 바이너리는 R2에 저장한다.
  - R2 공개 전달 도메인, 캐시 헤더, 이미지 URL 생성 규칙을 애플리케이션에 연결한다.
  - 필요 시 Cloudflare 이미지 변환, 업로드 후 변환 작업, 별도 이미지 서비스 중 하나를 선택해 문서화한다.
  - 애플리케이션 서버의 로컬 디스크와 `public/`은 사용자 업로드 저장소로 사용하지 않는다.
  - 공급자 변경이 가능한 URL 및 메타데이터 모델을 유지한다.

- [ ] 브라우저에서 Storage로 직접 업로드하는 흐름 구현
  - 서버가 발급한 presigned upload URL을 사용한다.
  - 업로드 파일의 MIME type, 확장자, 용량, 이미지 크기를 검증한다.
  - 사용자가 제공한 파일명을 storage key로 직접 사용하지 않는다.
  - 업로드 진행률과 실패 재시도를 지원한다.

- [ ] 이미지 변환 파이프라인 구현
  - 원본에서 320px, 640px, 828px, 약 1280px 변환본을 생성한다.
  - WebP/AVIF 전달 정책과 품질 기준을 정한다.
  - 20~40px blur placeholder 또는 `blurDataURL`을 생성한다.
  - 원본 너비, 높이, aspect ratio, 변환 URL을 DB에 저장한다.

- [ ] 버전 기반 불변 미디어 URL 적용
  - URL에 content hash 또는 asset version을 포함한다.
  - 파일 변경 시 기존 URL을 덮어쓰지 않고 새 URL을 생성한다.
  - 게시된 불변 자원에 긴 `Cache-Control`과 `immutable`을 적용한다.
  - CDN purge가 필요한 경우와 새 URL을 만드는 경우를 구분한다.

- [ ] 초안과 공개 미디어의 접근 정책 분리
  - draft 미디어의 비공개 접근 방식을 정의한다.
  - published 청첩장의 CDN 캐시 정책을 정의한다.
  - 서명 URL 만료가 공개 페이지의 이미지 표시와 CDN cache hit에 미치는 영향을 확인한다.

## P1. 반응형 이미지와 갤러리

- [ ] 공통 `WeddingImage` 타입 추가
  - original URL, 변환본, width, height, alt, blur 정보를 표현한다.
  - 기존 `string[]` 이미지 설정과의 마이그레이션 방법을 정한다.

- [ ] 이미지 컴포넌트의 크기와 `sizes` 검토
  - 430px 최대 컨테이너에 맞는 `sizes`를 지정한다.
  - 이미지마다 width/height 또는 aspect ratio를 확보한다.
  - 첫 화면 LCP 이미지 한 개만 `preload`한다.
  - 화면 밖 이미지는 lazy loading을 사용한다.

- [ ] 외부 CDN을 위한 Next.js 이미지 설정 추가
  - `next.config.ts`에 제한적인 `images.remotePatterns`를 설정한다.
  - CDN 이미지 변환과 Next.js 이미지 최적화 중 어느 계층이 변환을 담당할지 결정한다.
  - 이중 변환과 불필요한 Next.js 서버 중계를 방지한다.

- [ ] AlbumGallery 점진적 로딩 적용
  - 최초에는 viewport에 필요한 썸네일만 요청한다.
  - 다음 행은 viewport 진입 직전에 요청한다.
  - 전체 화면 뷰어를 열 때 large variant를 요청한다.
  - 갤러리 33장 전체가 첫 화면 네트워크 경쟁에 참여하지 않게 한다.

- [ ] 이미지 placeholder와 오류 UI 통일
  - blur, dominant color 또는 skeleton 중 공통 정책을 정한다.
  - 로딩 실패 시 레이아웃 크기를 유지한다.
  - 접근 가능한 대체 텍스트 정책을 추가한다.

## P1. 프레임 애니메이션과 영상

- [ ] MainIntro 45개 프레임의 전달 방식 재설계
  - 시간 기반이면 MP4/WebM 변환을 비교한다.
  - 스크롤 기반이면 초기 구간과 다음 구간으로 나눠 로딩한다.
  - 첫 프레임을 poster 및 Critical 이미지로 사용할 수 있게 한다.
  - 전체 45개가 준비되기 전 시작 가능한지 검증한다.

- [ ] VideoGreeting2 74개 프레임의 전달 방식 재설계
  - 영상, frame chunk, sprite 방식의 용량과 디코딩 성능을 비교한다.
  - 현재 위치에서 필요한 프레임만 메모리에 유지한다.
  - 저사양 기기와 reduced motion 상태에서 정적 대체 화면을 제공한다.

- [ ] 영상 공통 설정 추가
  - poster, preload, muted, playsInline, fallback을 데이터로 표현한다.
  - `preload="auto"` 사용 범위를 제한한다.
  - 디코딩 실패와 절전 모드 상태를 확인한다.

- [ ] BGM을 결혼식 설정으로 이동
  - 고정된 `/test-resources/bgm.mp3` 의존성을 제거한다.
  - BGM URL, 제목, 볼륨, loop 여부를 설정으로 표현한다.
  - 자동재생 실패가 정상적인 상태로 처리되는지 확인한다.
  - 사용자 재생 선택을 세션 동안 유지할지 결정한다.

## P1. 클라이언트 번들과 렌더링

- [ ] `SectionRegistry`의 정적 import를 variant 단위 동적 import로 변경
  - AR, Three.js, 대형 갤러리 코드가 사용하지 않는 청첩장의 초기 번들에 포함되지 않게 한다.
  - 동적 로딩 중 placeholder를 제공한다.
  - 각 variant의 chunk 크기를 build analyzer로 확인한다.

- [ ] `SectionRegistry`에 전달하는 데이터 범위 축소
  - 전체 WeddingConfig 대신 공개 렌더링에 필요한 데이터만 전달한다.
  - intro와 visible section만 직렬화한다.
  - 중복된 전역 데이터와 section content 병합 구조를 정리한다.

- [ ] 등록되지 않은 type/variant 처리 추가
  - 알 수 없는 type을 조용히 누락할지 오류 UI를 표시할지 환경별 정책을 정의한다.
  - 개발 환경에서는 section ID와 잘못된 매핑을 명확히 표시한다.
  - 운영 환경에서는 전체 페이지 장애로 번지지 않게 한다.

- [ ] intro 선택과 visible 규칙 통일
  - 첫 번째 intro를 무조건 overlay 대상으로 선택하는 현재 동작을 검토한다.
  - intro의 `isVisible` 처리와 일반 섹션의 `isVisible` 처리를 일관되게 한다.
  - intro가 없거나 실패한 청첩장의 시작 동작을 정의한다.

## P1. 배경과 모바일 인터랙션

- [ ] `AdaptiveBackground`의 하드코딩 제거
  - `/bg/silk-bg-fixed-dark.webp`를 theme 또는 wedding 설정으로 이동한다.
  - `sec_memories` 문자열 대신 설정 가능한 전환 기준을 사용한다.
  - memories 섹션이 없는 청첩장의 opacity 동작을 처리한다.

- [ ] sticky 높이와 viewport 단위 검증
  - 320px, 375px, 430px 화면에서 variant별 scroll range를 확인한다.
  - iOS Safari의 주소창 변화에서 `svh`, `dvh`, `lvh` 동작을 확인한다.
  - 마지막 섹션의 높이 계산과 sticky 종료 지점을 확인한다.

- [ ] `prefers-reduced-motion` 대체 동작 추가
  - 긴 scroll animation과 parallax를 축소하거나 정적 화면으로 전환한다.
  - 콘텐츠 확인에 애니메이션 완료가 필수가 되지 않게 한다.
  - Snow, FlyingGallery, frame animation을 각각 확인한다.

- [ ] 터치 및 스크롤 충돌 점검
  - 카카오 인앱 브라우저와 iOS Safari에서 sticky, modal, image viewer를 테스트한다.
  - 배경 및 effect 레이어가 `pointer-events`를 가로채지 않는지 확인한다.
  - 이미지 보호 로직이 버튼, 길게 누르기 외 동작과 충돌하는지 확인한다.

## P1. 메타데이터와 공유

- [ ] canonical base URL을 단일 모듈에서 관리
  - `NEXT_PUBLIC_BASE_URL`, `VERCEL_URL`, localhost fallback 사용 위치를 통합한다.
  - 서버 metadata와 클라이언트 공유 URL이 동일한 주소를 사용하게 한다.

- [ ] 기본 OG 이미지 경로 통일
  - metadata와 공유 fallback이 동일한 WebP 기본 이미지를 사용하게 한다.
  - 실제 존재하는 기본 파일을 사용한다.
  - 결혼식별 OG 이미지가 없거나 로드에 실패할 때의 결과를 테스트한다.

- [ ] metadata 조회 중복과 캐시 정책 정리
  - `generateMetadata()`와 page rendering이 같은 검증된 조회 결과를 재사용하게 한다.
  - 게시 데이터 변경 시 metadata와 페이지 cache를 함께 무효화한다.

- [ ] 카카오 공유 호환성 테스트
  - SDK 키 누락, SDK 로드 실패, 공유 데이터 미준비 상태를 처리한다.
  - 카카오톡 인앱 브라우저에서 링크, 이미지, 날짜, 장소 표시를 확인한다.

## P2. 운영 안정성과 관리 기능

- [ ] 청첩장 생성·수정·게시 관리자 흐름 구현
  - draft 저장, preview, publish, archive 상태 전환을 지원한다.
  - 섹션 순서, visibility, variant와 content를 편집한다.
  - 게시 전 설정과 미디어 준비 상태를 검증한다.

- [ ] 캐시 및 무효화 정책 구현
  - 결혼식 데이터의 요청 단위 중복 조회를 제거한다.
  - 공개 페이지 캐시와 미디어 CDN 캐시를 분리한다.
  - 게시/수정/보관 이벤트에서 필요한 tag/path를 무효화한다.

- [ ] 페이지 loading/error/not-found 경계 추가
  - 데이터 조회 중 loading UI를 제공한다.
  - 섹션 오류가 전체 청첩장 장애로 번지지 않게 할 범위를 정한다.
  - 없는 청첩장, 비공개 청첩장, 만료된 청첩장의 화면을 구분한다.

- [ ] 개인정보 및 만료 정책 구현
  - 계좌번호, 전화번호, 가족 이름의 공개 범위를 설정한다.
  - 공개 종료일 이후 처리와 삭제 요청 절차를 정의한다.
  - 검색 엔진 index 허용 여부를 결혼식별로 설정할 수 있게 한다.

- [ ] 업로드 보안 추가
  - 서버에서 MIME sniffing과 파일 시그니처를 검증한다.
  - 이미지 decompression bomb와 과도한 해상도를 제한한다.
  - 악성 SVG 및 실행 가능한 파일 업로드를 차단한다.
  - 소유자가 다른 결혼식 경로에 업로드하지 못하게 한다.

- [ ] 접근성과 콘텐츠 fallback 점검
  - 이미지 alt, 버튼 aria-label, focus 이동, 색상 대비를 검토한다.
  - JavaScript 또는 애니메이션 실패 상태에서도 핵심 예식 정보를 확인할 수 있게 한다.
  - 키보드와 스크린리더로 갤러리 및 계좌 UI를 확인한다.

## P2. 성능 측정과 검증

- [ ] 성능 baseline 기록
  - 현재 `/younghoo_yeeun`의 Lighthouse와 Web Vitals를 기록한다.
  - 초기 요청 수, 초기 전송량, LCP, CLS, INP를 저장한다.
  - intro 45장, video 74장, gallery 33장의 waterfall을 별도 기록한다.

- [ ] 모바일 성능 예산 정의
  - LCP 75번째 백분위 2.5초 이하를 목표로 설정한다.
  - 초기 Critical 전송량 목표를 정한다.
  - 첫 화면의 동시 대형 미디어 요청 수를 제한한다.
  - variant별 JavaScript chunk 크기 예산을 정한다.

- [ ] 실제 환경 테스트 매트릭스 구축
  - 320px, 375px, 430px viewport
  - 느린 4G
  - iOS Safari
  - Android Chrome
  - 카카오톡 인앱 브라우저
  - `prefers-reduced-motion`
  - 자동재생 허용 및 거부 상태

- [ ] 자동화된 검증 추가
  - TypeScript, ESLint, production build를 CI에서 실행한다.
  - 유효/없는/비공개 wedding slug 라우팅 테스트를 추가한다.
  - section mapping과 runtime schema 테스트를 추가한다.
  - 미디어 URL 중복 요청 또는 preload 정책의 회귀 테스트 방법을 마련한다.

## 구현 순서 제안

1. 없는 ID fallback과 공개 데이터 경계를 먼저 수정한다.
2. 프리로드 중복과 전체 미디어 대기를 제거한다.
3. Object Storage/CDN 및 이미지 변환 구조를 결정한다.
4. 갤러리에 반응형 이미지와 점진적 로딩을 적용한다.
5. 프레임 애니메이션과 BGM을 결혼식 설정으로 이동한다.
6. section 동적 import와 클라이언트 payload 축소를 진행한다.
7. 관리자 게시 흐름, 캐시, 운영 검증을 추가한다.

## 공통 완료 기준

각 TODO는 다음 항목을 확인한 뒤 완료 처리한다.

- [ ] 기존 `/younghoo_yeeun` 청첩장의 핵심 콘텐츠가 유지된다.
- [ ] `npm run lint`를 통과한다.
- [ ] `npm run build`를 통과한다.
- [ ] 320~430px 화면에서 가로 스크롤이나 레이아웃 깨짐이 없다.
- [ ] 느린 네트워크에서 전체 미디어가 없어도 첫 화면을 사용할 수 있다.
- [ ] 카카오톡 인앱 브라우저 또는 동등한 모바일 환경에서 핵심 흐름을 확인한다.
