# 미디어옵스 대시보드

광고 캠페인 운영, 매출 분석, 리포트 확인을 위한 **B2B SaaS 운영 대시보드** 포트폴리오 프로젝트입니다.  
단순 UI 데모가 아니라, **상태 관리 설계**, **권한 제어**, **재사용 가능한 컴포넌트 구조**, **접근성**, **테스트**, **성능 최적화 포인트**까지 포함한 프론트엔드 아키텍처를 보여주는 것을 목표로 했습니다.

## 프로젝트 개요

`미디어옵스 대시보드`는 광고 운영자가 여러 캠페인의 성과를 빠르게 파악하고,  
검색/필터/정렬/페이지네이션을 통해 데이터를 탐색하며,  
상세 페이지에서 KPI와 운영 메모를 관리할 수 있도록 구성한 내부 운영툴 컨셉의 대시보드입니다.

핵심 방향은 다음과 같습니다.

- **서버 상태와 클라이언트 상태를 명확히 분리**
- **권한에 따라 화면과 액션을 분리**
- **공통 UI를 재사용 가능한 구조로 설계**
- **로딩/빈 상태/에러 상태를 실제 서비스 수준으로 구성**
- **Storybook과 Playwright로 품질 검증 체계 확보**

## 주요 기능

### 1) 로그인 / 권한 제어

- `/login`에서 `관리자`, `매니저`, `조회 전용` 데모 계정으로 로그인
- 로그인 사용자 정보는 `Zustand` store에 저장
- 권한 정책은 별도 파일로 분리
- 라우트 접근 제어와 버튼/액션 권한 제어를 분리

권한별 동작:

- `관리자`
  - 모든 메뉴 접근 가능
  - 캠페인 상태 변경 가능
  - 운영 메모 수정 가능
  - 일괄 상태 변경 가능
  - 설정 내 관리자 전용 영역 확인 가능
- `매니저`
  - 대시보드 / 캠페인 / 리포트 / 설정 접근 가능
  - 캠페인 상태 변경 가능
  - 운영 메모 수정 가능
  - 일괄 상태 변경 가능
- `조회 전용`
  - 조회 전용
  - 메모 수정 불가
  - 일괄 상태 변경 불가
  - 관리자 전용 설정 영역 접근 불가

### 2) 대시보드

- 총 매출, 총 광고비, 평균 ROAS, 평균 전환율, 활성 캠페인 수
- 전월 대비 증감률 노출
- 매출/광고비 추이 차트
- 캠페인 상태별 분포 차트
- 성과 상위 캠페인 Top 5 테이블
- 성과 저하 알림 카드
- 스켈레톤 / 빈 상태 / 오류 상태 지원

### 3) 캠페인

- 캠페인명 검색
- 상태 필터: `active`, `paused`, `ended`
- 채널 필터: `google`, `meta`, `naver`, `kakao`
- 기간 필터
- 정렬: 매출, 광고비, ROAS, 전환율
- 페이지네이션
- CSV 다운로드
- 필터 프리셋 저장 / 불러오기 / 삭제
- 선택 캠페인 일괄 상태 변경
- URL 쿼리 문자열 기반 상태 동기화

### 4) 캠페인 상세

- 캠페인 기본 정보
- KPI 카드
- 성과 추이 차트
- 소재별 성과 테이블
- 채널별 성과 비교
- 예산 소진율
- 운영 메모 작성 / 수정
- 캠페인 상태 변경
- `개요 / 소재 성과 / 매출 분석 / 메모` 탭 분리
- 메모 수정 및 상태 변경에 **optimistic update** 적용

### 5) 리포트

- 기간별 매출 리포트
- 채널별 광고비 대비 매출 비교
- 캠페인별 ROAS 랭킹
- 차트 + 테이블 조합
- CSV 다운로드

### 6) 설정

- 현재 로그인 사용자 정보
- 권한별 접근 가능 범위 설명
- 저장된 필터 프리셋 관리
- 다크모드 토글
- 사이드바 접힘 상태 저장

## 기술 스택

- `React 19`
- `TypeScript`
- `Vite`
- `React Router`
- `TanStack Query`
- `Zustand`
- `Tailwind CSS v4`
- `MSW`
- `Recharts`
- `Storybook`
- `Playwright`

## 아키텍처 설계 포인트

### 서버 상태 / 클라이언트 상태 분리

- **TanStack Query**
  - 대시보드 / 캠페인 / 리포트 / 상세 데이터 조회
  - 캐싱, invalidate, optimistic update 처리
- **Zustand**
  - 로그인 사용자
  - 테마
  - 사이드바 상태
  - 토스트 피드백
- **URL Query String**
  - 검색어
  - 필터
  - 정렬
  - 페이지 상태

### 권한 정책 분리

- `hasPermission(role, permission)` 유틸 기반
- 메뉴 노출 제어와 액션 제어를 분리
- viewer는 라우트는 접근 가능하더라도 수정 액션은 제한

### 컴포넌트 재사용성

공통 UI를 개별 페이지에서 직접 구현하지 않고 재사용 가능한 단위로 분리했습니다.

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
- `ChartCard`
- `MetricCard`
- `ToastRegion`

## 품질 보강 포인트

### 접근성

- Skip link 제공
- `aria-label` 기반 입력/액션 설명
- `aria-live` 기반 상태 피드백
- Tabs 키보드 이동 지원
- Modal `ESC` 닫기 및 focus trap 적용
- 색상에만 의존하지 않고 텍스트 정보 병행

### 사용자 경험

- Skeleton loading
- Empty state
- Error fallback
- CSV 다운로드
- 필터 preset 저장/불러오기
- 전역 toast 피드백

### 성능

- 페이지 단위 lazy loading
- 차트/무거운 뷰 분리
- 검색 debounce 적용
- 상세 페이지 prefetch
- `useMemo` 기반 파생 데이터 계산 최소화
- Query 캐시 기반 재요청 최소화

## 목업 API

MSW 기반 mock API를 구성했습니다.

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

추가로 일부 endpoint는 아래 디버그 상태를 지원합니다.

- `?mock=error`
- `?mock=empty`

## 스토리북

주요 공통 컴포넌트에 대해 Storybook을 구성했습니다.

예시:

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

## E2E 테스트

Playwright로 핵심 사용자 흐름을 검증합니다.

- 조회 전용 계정의 읽기 전용 접근 확인
- 관리자 계정의 필터 프리셋 저장/불러오기 및 CSV 다운로드
- 관리자 계정의 캠페인 상세 상태 변경 / 메모 저장 흐름 확인

## 프로젝트 구조

```text
src/
  app/                라우터, provider, query client
  components/         공통 UI, 차트, 레이아웃, 기능 컴포넌트
  features/           권한 정책, auth, campaigns, UI store
  hooks/              공통 hook
  lib/                API client, formatter, download 유틸
  mocks/              MSW worker, handlers, mock data
  pages/              라우트 페이지
  types/              도메인 타입
tests/
  e2e/                Playwright 시나리오
.storybook/           Storybook 설정
```

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. Storybook 실행

```bash
npm run storybook
```

### 4. 프로덕션 빌드

```bash
npm run build
```

### 5. 린트

```bash
npm run lint
```

### 6. E2E 테스트

```bash
npm run test:e2e
```

## 검증 완료 항목

현재 기준으로 아래 명령을 통과했습니다.

- `npm run build`
- `npm run lint`
- `npm run storybook:build`
- `npm run test:e2e`

## 이 프로젝트에서 보여주고자 한 역량

- **React 애플리케이션 구조 설계 능력**
- **상태 관리 계층 분리 능력**
- **권한 기반 UI/라우팅 설계 능력**
- **재사용 가능한 컴포넌트 시스템 구성 능력**
- **MSW 기반 프론트엔드 독립 개발 환경 구성 능력**
- **접근성과 UX 품질에 대한 고려**
- **Storybook / Playwright 기반 품질 보증 경험**

---

이 프로젝트는 “예쁘게 보이는 대시보드”보다,  
**실무형 프론트엔드 개발자가 어떤 방식으로 구조를 나누고, 상태를 관리하고, 품질을 보강하는지**를 보여주는 데 초점을 맞췄습니다.
