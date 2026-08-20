# WE:GREEN Sprint Mission 6 — 작업 정리

작성일: 2026-08-12

## 목표

미션 5 정적 퍼블리싱(HTML/CSS/JS)을 기반으로, 백엔드 없이 동작하는 **React 프론트엔드 MVP**를 구현한다.

---

## 오늘 완료한 작업

### 1. 프로젝트 전환
- Vite + React + TypeScript 스캐폴딩
- 기존 정적 페이지는 `legacy/`에 보관
- 에셋은 `public/assets`로 이전, 스타일은 `src/styles.css`로 통합
- React Router, Vercel SPA rewrite(`vercel.json`) 설정

### 2. 핵심 MVP 기능 (4개)
1. **업체 목록 조회 + 필터** — 지역/전문 분야, empty state
2. **업체 상세 보기** — Mock + 사용자 등록 데이터, 문의 연락처 토글
3. **업체 등록** — 폼 검증 후 localStorage 저장, 새로고침 유지
4. **로그인 시뮬레이션** — localStorage 기반 인증, 등록 페이지 보호

### 3. User Flow (React Router)
```
/                      홈
/companies             업체 목록 + 필터
/companies/:id         업체 상세
/login                 로그인
/register              업체 등록 (로그인 필요)
/register/complete/:id 등록 완료
```

### 4. interface 기반 타입 설계
`src/types/index.ts`
- `Company`, `CompanyFilters`
- `AuthUser`, `LoginFormValues`, `RegisterFormValues`
- `FormErrors`, `FaqItem`
- UI Props는 각 컴포넌트 파일에 정의

### 5. 컴포넌트 구조
```
src/
  components/
    ui/          Button, Input, Select, TextArea, Card, EmptyState, LoadingState
    layout/      Header, Footer, Layout, PageHero
    company/     CompanyCard
  context/       AuthContext, CompanyContext
  data/          companies(Mock), storage(localStorage)
  hooks/         usePageTitle
  pages/         Home, Companies, Detail, Login, Register, Complete
  utils/         companyFilters, validation
  types/         도메인 interface
```

### 6. 리뷰·리팩토링
- 잘못된 `page-hero` 클래스 → `PageHero`(`subpage-hero`)로 통일
- 목록 진입 시 불필요 `refresh`/전역 로딩 제거 → `isRegistering` 분리
- 해시 앵커 스크롤 타이밍 수정
- 검증/필터 로직 유틸 추출
- 페이지별 `document.title` 설정

---

## 요구사항 체크

| 요구사항 | 상태 |
|----------|------|
| 핵심 기능 2~4개 | ✅ |
| React 컴포넌트 전환 | ✅ |
| React Router User Flow | ✅ |
| useState 등 상태/상호작용 | ✅ |
| Mock + localStorage 영속화 | ✅ |
| 로그인 시뮬레이션 (심화) | ✅ |
| 에러/로딩/empty UX (심화) | ✅ |
| 디자인 시스템(공통 UI) (심화) | ✅ |
| Mock Server (선택) | ⏭ 미적용 |
| GitHub Public + push | ❌ 미완료 |
| Vercel 배포 URL | ❌ 미완료 |

---

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

---

## 남은 작업 (제출)

1. **커밋 & push**
   - 브랜치: 현재 `sprint-mission-5` (미션 6용 브랜치 분리 권장)
   - 원격: `https://github.com/seonu2070-droid/we-green.git`
2. **Vercel 재배포**
   - Framework: Vite
   - Build: `npm run build` / Output: `dist`
   - SPA rewrite는 `vercel.json`에 포함됨
3. **제출물**
   - GitHub 저장소 URL (Public)
   - Vercel 배포 URL (접속 확인)

---

## 참고: 데이터 저장 키

| Key | 내용 |
|-----|------|
| `wegreen:auth` | 로그인 사용자 |
| `wegreen:user-companies` | 사용자가 등록한 업체 목록 |
