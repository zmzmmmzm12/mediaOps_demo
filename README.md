# MediaOps Dashboard

광고 캠페인 운영, 매출 분석, 리포트 확인을 위한 **B2B SaaS 관리자 대시보드** 포트폴리오 프로젝트입니다.

단순히 화면만 구성한 데모가 아니라, **Next.js App Router 기반 라우팅**, **Route Handler mock API**, **권한 제어**, **서버 상태/클라이언트 상태 분리**, **i18n**, **공통 디자인 시스템**, **Storybook**, **Playwright E2E 테스트**까지 포함해 실무형 프론트엔드 구조를 보여주는 것을 목표로 했습니다.

## 프로젝트 개요

MediaOps Dashboard는 광고 운영자가 여러 캠페인의 성과를 빠르게 파악하고, 검색/필터/정렬/페이지네이션을 통해 데이터를 탐색하며, 상세 화면에서 KPI와 운영 메모를 관리할 수 있도록 구성한 내부 운영툴 컨셉의 대시보드입니다.

UI 톤은 Linear, Vercel Dashboard, Stripe Dashboard, Amplitude 같은 **깔끔한 B2B SaaS 관리자 화면**을 기준으로 정리했습니다.

## 핵심 특징

- **Next.js 16 App Router** 기반 페이지 라우팅
- **app/api Route Handler** 기반 mock API
- **React 19 + TypeScript** 기반 컴포넌트 구조
- **TanStack Query** 기반 서버 상태 관리
- **Zustand** 기반 인증, 테마, 언어, 토스트 상태 관리
- **Tailwind CSS v4**와 CSS 변수 기반 디자인 토큰
- **권한별 메뉴/액션 제어**
- **한국어, 영어, 중국어, 일본어 i18n**
- **Storybook** 기반 주요 UI 컴포넌트 문서화
- **Playwright** 기반 핵심 사용자 흐름 검증

## 주요 기능

### 로그인 / 권한 제어

- `/login`에서 데모 계정 선택 후 로그인
- 사용자 세션은 `Zustand` store에 저장
- 권한 정책은 `src/features/auth/permissions.ts`에서 관리
- 권한에 따라 사이드바 메뉴와 수정 액션을 분리

권한별 동작:

- `관리자`
  - 모든 메뉴 접근 가능
  - 캠페인 상태 변경 가능
  - 운영 메모 수정 가능
  - 일괄 상태 변경 가능
  - 설정 내 관리자 전용 영역 확인 가능
- `매니저`
  - 대시보드, 캠페인, 리포트, 설정 접근 가능
  - 캠페인 상태 변경 가능
  - 운영 메모 수정 가능
  - 일괄 상태 변경 가능
- `조회 전용`
  - 데이터 조회 가능
  - 메모 수정 불가
  - 캠페인 상태 변경 불가
  - 일괄 상태 변경 불가
  - 관리자 전용 설정 영역 접근 불가

### 대시보드

- 총 매출, 총 광고비, 평균 ROAS, 평균 전환율, 운영 중 캠페인 수
- 매출/광고비 추이 차트
- 캠페인 상태 분포 차트
- 성과 상위 캠페인 테이블
- 운영 알림 카드
- skeleton, empty, error state 지원

### 캠페인

- 캠페인명, 채널, 담당자 기반 검색
- 상태 필터: `active`, `paused`, `ended`
- 채널 필터: `google`, `meta`, `naver`, `kakao`
- 기간 필터
- 매출, 광고비, ROAS, 전환율 정렬
- 페이지네이션
- CSV 다운로드
- 필터 프리셋 저장 / 불러오기 / 삭제
- 선택 캠페인 일괄 상태 변경
- URL query string 기반 필터 상태 동기화

### 캠페인 상세

- 캠페인 기본 정보와 상태/우선순위 badge
- KPI 카드
- 성과 추이 차트
- 소재별 성과 테이블
- 채널별 성과 비교
- 예산 소진율
- 운영 활동 로그
- 운영 메모 작성 / 수정
- 캠페인 상태 변경
- `개요 / 소재 / 매출 / 메모` 탭 구성
- 상태 변경과 메모 저장에 optimistic update 적용

### 리포트

- 기간별 매출 추이
- 채널별 매출 대비 광고비 비교
- 캠페인별 ROAS 랭킹
- 차트와 테이블을 함께 제공
- CSV 다운로드

### 설정

- 현재 로그인 사용자 정보
- 현재 역할과 권한 범위 안내
- 라이트/다크 테마 변경
- 저장된 필터 프리셋 관리
- 관리자 권한 전용 안내 영역

### 다국어

- 헤더 언어 버튼에서 언어 선택
- 지원 언어:
  - 한국어
  - English
  - 中文
  - 日本語
- 번역 리소스는 `src/i18n/locales/*.json`에서 관리
- 선택 언어는 `Zustand persist`로 저장

## 기술 스택

- `Next.js 16`
- `React 19`
- `TypeScript`
- `TanStack Query`
- `Zustand`
- `Tailwind CSS v4`
- `Recharts`
- `Storybook`
- `Playwright`
- `ESLint`

## 아키텍처 설계

### App Router

페이지 라우팅은 `app` 디렉터리의 Next.js App Router를 사용합니다.

- `app/(workspace)/dashboard/page.tsx`
- `app/(workspace)/campaigns/page.tsx`
- `app/(workspace)/campaigns/[campaignId]/page.tsx`
- `app/(workspace)/reports/page.tsx`
- `app/(workspace)/settings/page.tsx`
- `app/login/page.tsx`
- `app/forbidden/page.tsx`

실제 화면 구현은 `src/views`에 두고, `app` 라우트 파일은 해당 view를 연결하는 구조입니다.

### Mock API

현재 데이터 API는 Next.js Route Handler로 구성했습니다.

- `GET /api/auth/me`
- `GET /api/auth/profiles`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET /api/campaigns`
- `GET /api/campaigns/:campaignId`
- `PATCH /api/campaigns/:campaignId`
- `PATCH /api/campaigns/:campaignId/memo`
- `GET /api/reports`
- `GET /api/filter-presets`
- `POST /api/filter-presets`
- `DELETE /api/filter-presets/:presetId`

mock 데이터는 `src/mocks/data.ts`에 있으며, API 응답 유틸은 `src/server/api-utils.ts`에서 관리합니다.

일부 API는 테스트와 상태 검증을 위해 아래 query를 지원합니다.

- `?mock=error`
- `?mock=empty`

### 상태 관리

- **TanStack Query**
  - 대시보드, 캠페인, 상세, 리포트, 프리셋 데이터 조회
  - 캐싱과 invalidate 처리
  - optimistic update 처리
- **Zustand**
  - 로그인 세션
  - 테마
  - 언어
  - 토스트
- **URL query string**
  - 검색어
  - 필터
  - 정렬
  - 페이지

### 디자인 시스템

공통 UI는 `src/components/ui`에 분리했습니다.

- `Button`
- `Input`
- `Select`
- `DateRangePicker`
- `Tabs`
- `DataTable`
- `Pagination`
- `Modal`
- `ConfirmDialog`
- `PageHeader`
- `EmptyState`
- `ErrorStatePanel`
- `Skeleton`
- `StatusBadge`
- `ToastRegion`

카드, border, radius, padding, focus-visible, hover, disabled, loading 상태는 CSS 변수와 Tailwind class를 조합해 동일한 톤으로 맞췄습니다.

## 프로젝트 구조

```text
app/
  (workspace)/         인증 후 접근하는 대시보드 라우트 그룹
  api/                 Next.js Route Handler mock API
  login/               로그인 라우트
  forbidden/           권한 제한 라우트
  layout.tsx           전역 메타데이터와 루트 레이아웃

src/
  app/                 QueryClient, Provider 구성
  components/          UI, layout, chart, feature 컴포넌트
  features/            auth, campaigns, ui store, 권한 정책
  hooks/               공통 hook
  i18n/                다국어 리소스와 번역 helper
  lib/                 API client, format, download, utility
  mocks/               mock data, MSW 호환 파일
  server/              API response utility
  types/               도메인 타입
  views/               실제 페이지 화면 구현

tests/
  e2e/                 Playwright E2E 테스트

.storybook/            Storybook 설정
```

## Storybook

주요 공통 컴포넌트와 기능 컴포넌트의 stories를 구성했습니다.

- `Button`
- `Input`
- `Select`
- `DateRangePicker`
- `Tabs`
- `DataTable`
- `PageHeader`
- `StatusBadge`
- `EmptyState`
- `ErrorStatePanel`
- `MetricCard`
- `CampaignCard`
- `CampaignFilters`
- `PrioritySelector`

## E2E 테스트

Playwright로 핵심 사용자 흐름을 검증합니다.

- 조회 전용 계정의 읽기 전용 접근
- 관리자 계정의 필터 프리셋 저장 / 불러오기
- CSV 다운로드
- 캠페인 상세 상태 변경
- 운영 메모 저장

## 실행 방법

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

### 프로덕션 서버 실행

```bash
npm run preview
```

### 린트

```bash
npm run lint
```

### Storybook 실행

```bash
npm run storybook
```

### Storybook 빌드

```bash
npm run storybook:build
```

### E2E 테스트

```bash
npm run test:e2e
```

## 검증 완료

현재 구조 기준으로 아래 명령을 통과하도록 관리합니다.

- `npm run lint`
- `npm run build`
- `npm run storybook:build`
- `npm run test:e2e`

## 포트폴리오 포인트

이 프로젝트는 시각적으로 보기 좋은 관리자 화면뿐 아니라, 실제 프론트엔드 개발에서 중요한 구조적 역량을 함께 보여주기 위해 구성했습니다.

- Next.js App Router 기반 화면 구조 설계
- Route Handler 기반 mock API 설계
- 서버 상태와 클라이언트 상태 분리
- 권한 기반 메뉴/액션 제어
- 재사용 가능한 UI 컴포넌트 설계
- URL 기반 필터 상태 관리
- optimistic update 구현
- 다국어 리소스 분리와 언어 상태 유지
- 접근성, empty/error/skeleton 상태 고려
- Storybook과 Playwright 기반 품질 검증
