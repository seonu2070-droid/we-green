# WE:GREEN

지역 조경업체를 조회하고, 로그인한 파트너가 업체를 등록할 수 있는 풀스택 MVP입니다.

## 제출 정보

- GitHub 저장소: <https://github.com/seonu2070-droid/we-green>
- 배포 URL(Vercel): <https://wegreensubmission.vercel.app>

## 기술 스택

- 프론트엔드: React 19, TypeScript, React Router, Vite
- 백엔드: Node.js 24, Express 5, Zod 4, JOSE
- 저장소: JSON 파일 저장소(직렬화된 쓰기와 임시 파일 교체)
- 인증: 2시간 만료 HS256 JWT
- 배포: Docker, Render Blueprint, 영속 디스크

## 핵심 API 범위

1. 업체 목록·상세 조회
2. 데모 계정 로그인과 현재 세션 확인
3. JWT가 필요한 업체 등록
4. 서버 상태 확인
5. OpenAI 기반 업체 추천 (로그인 불필요)

업체 데이터는 `server/data/companies.json`에 저장됩니다. 파일이 없으면 서버 시작 후 첫 조회 시 `server/data/seed-companies.ts`의 초기 데이터로 생성됩니다. 등록 요청은 메모리의 이전 상태가 아닌 저장 파일의 최신 상태를 읽은 후 직렬화하여 처리합니다.

## 로컬 실행

Node.js 24 이상을 권장합니다.

```bash
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell에서는 `Copy-Item .env.example .env`를 사용할 수 있습니다. `.env`를 만들지 않아도 로컬 기본값으로 실행됩니다.

- 프론트엔드: `http://localhost:5173`
- API: `http://localhost:8787`
- 상태 확인: `http://localhost:8787/api/health`

Vite 개발 서버가 `/api` 요청을 API 서버로 프록시합니다.

### 체험 계정

- 이메일: `partner@wegreen.test`
- 비밀번호: `green1234`

운영 환경에서는 `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`, `DEMO_USER_NAME`으로 변경합니다.

## 환경 변수

- `VITE_API_BASE_URL`: 프론트와 API 도메인이 다를 때 API 기준 URL. 같은 도메인이면 비워 둡니다.
- `PORT`: API 포트. 기본값 `8787`.
- `JWT_SECRET`: JWT 서명 키. 운영 환경에서는 필수입니다.
- `ALLOWED_ORIGINS`: 허용할 프론트 Origin을 쉼표로 구분합니다.
- `DATA_FILE`: 업체 JSON 파일 경로.
- `DEMO_USER_EMAIL`: 데모 로그인 이메일.
- `DEMO_USER_PASSWORD`: 데모 로그인 비밀번호.
- `DEMO_USER_NAME`: 로그인 사용자 표시 이름.
- `OPENAI_API_KEY`: AI 업체 추천 기능에 사용하는 OpenAI API 키(선택). 비워 두면 `/api/recommend`가 `503 AI_UNAVAILABLE`을 반환하고, 나머지 기능은 그대로 동작합니다.

## AI 업체 추천 기능

### 선택 이유

MVP는 지역·전문 분야 드롭다운으로만 업체를 걸러볼 수 있어서, 사용자가 자신의 상황(예: "강아지와 함께 뛰어놀 마당")을 직접 후보 기준으로 번역해야 하는 한계가 있었습니다. 이 기능은 자유 텍스트 설명을 받아 OpenAI API로 후보 업체 중 가장 잘 맞는 곳을 골라주어, 드롭다운 탐색을 보완합니다.

### 동작 방식

1. 사용자가 홈 화면의 "어떤 정원을 원하시나요?" 섹션에 상황을 자유 텍스트로 입력합니다.
2. 프론트엔드가 `POST /api/recommend`를 호출합니다(로그인 불필요).
3. 서버가 현재 업체 목록(`GET /api/companies`와 동일한 소스)과 사용자 입력을 함께 OpenAI(`gpt-4o-mini`)에 전달합니다.
4. 모델이 고른 업체 id를 서버가 실제 업체 목록과 대조해 검증한 뒤(목록에 없는 id는 폐기), 최대 3곳을 추천 이유와 함께 반환합니다.
5. 프론트엔드는 각 추천 업체를 기존 `CompanyCard`로 렌더링하고, 그 위에 AI가 작성한 한 줄 이유를 보여줍니다.

### 기술 선택 이유

- **모델**: 단순 매칭/요약 수준의 작업이라 `gpt-4o-mini`로 비용과 지연을 낮췄습니다. 더 복잡한 추론이 필요해지면 모델만 교체하면 됩니다.
- **키 관리**: `OPENAI_API_KEY`는 서버 환경 변수로만 존재하고 클라이언트 번들에는 포함되지 않습니다. 프론트는 `/api/recommend`만 호출하고, 실제 OpenAI 호출은 항상 서버(`server/openai.ts`)에서 이루어집니다.
- **검증**: 응답 JSON을 그대로 신뢰하지 않고, id가 실제 업체 목록에 있는지 서버에서 다시 확인합니다. 이렇게 하면 모델이 존재하지 않는 업체를 지어내도 화면에 노출되지 않습니다.
- **실패 처리**: 키 미설정은 `503 AI_UNAVAILABLE`, OpenAI 응답 실패·형식 오류는 `502 AI_UPSTREAM_ERROR`로 구분해 반환합니다. 프론트는 두 경우 모두 로딩 상태를 내리고 에러 배너로 안내하며, 나머지 서비스(목록 조회·등록·로그인)에는 영향이 없습니다.

### 데모 시나리오

1. `npm run dev`로 로컬 실행 후 홈 화면에서 "강아지와 함께 뛰어놀 수 있는 작은 마당을 서울에 만들고 싶어요"를 입력하고 "AI에게 추천받기"를 누릅니다.
2. `OPENAI_API_KEY`가 설정되어 있으면 몇 초 로딩 후 업체 카드와 추천 이유가 표시됩니다.
3. `OPENAI_API_KEY`가 없으면 "AI 추천 기능이 아직 설정되지 않았습니다." 배너가 표시되고, 다른 기능은 평소대로 동작합니다.

### 확장 가능성

- **다른 고도화 기능과의 결합**: `/api/recommend`는 인증 없이 독립적으로 동작하는 라우트라 유저 기능(실사용자 인증)이나 결제 기능을 나중에 추가해도 충돌하지 않습니다. 로그인한 사용자에게만 열고 싶어지면 이미 있는 `requireAuth` 미들웨어를 그대로 재사용하면 됩니다.
- **기능 세분화**: OpenAI 호출 로직이 `server/openai.ts` 한 파일에 격리되어 있어, 프롬프트 조정·추천 개수 변경·모델 교체·지역/전문분야 필터와의 결합(하이브리드 추천) 등을 라우팅 코드 변경 없이 적용할 수 있습니다.
- **사용자 수 증가 대응**: 현재는 요청마다 OpenAI를 직접 호출하고 캐시가 없어서, 트래픽이 늘면 동일 질문 캐싱이나 요청 빈도 제한을 추가하는 것이 다음 단계가 됩니다. 업체 데이터도 JSON 파일 저장소이지만 `CompanyRepository`가 인터페이스로 분리되어 있어, 규모가 커지면 구현체만 DB 기반으로 교체하면 됩니다.

## API 문서

모든 성공 응답은 `{ "data": ... }`, 오류 응답은 `{ "error": { "code", "message", "fields"? } }` 형식입니다.

### `GET /api/health`

서버 상태를 확인합니다.

```json
{ "data": { "status": "ok" } }
```

### `POST /api/auth/login`

데모 계정을 확인하고 JWT를 발급합니다.

```json
{
  "email": "partner@wegreen.test",
  "password": "green1234",
  "name": "파트너"
}
```

성공 시 `user`와 `accessToken`을 반환합니다. 계정이 맞지 않으면 `401 INVALID_CREDENTIALS`를 반환합니다.

### `GET /api/auth/me`

`Authorization: Bearer <token>` 헤더가 필요합니다. 유효한 JWT의 사용자 정보를 반환하며, 토큰이 없거나 만료되면 `401`을 반환합니다.

### `GET /api/companies`

업체 목록을 반환합니다. `region`, `specialty` 쿼리로 선택적으로 필터링할 수 있습니다.

```text
GET /api/companies?region=경기&specialty=식재%20디자인
```

### `GET /api/companies/:id`

업체 한 곳을 반환합니다. 존재하지 않으면 `404 COMPANY_NOT_FOUND`를 반환합니다.

### `POST /api/companies`

JWT가 필요한 업체 등록 API입니다.

```json
{
  "companyName": "WE 조경",
  "businessType": "개인사업자",
  "introduction": "지역의 환경과 생활 동선을 고려해 오래가는 정원을 만듭니다.",
  "region": "경기",
  "specialties": ["주택 정원 조성"],
  "career": "8",
  "managerName": "홍길동",
  "email": "partner@wegreen.test",
  "agreement": true
}
```

성공하면 `201`과 생성된 업체를 반환합니다. 입력이 잘못되면 `400 VALIDATION_ERROR`와 필드별 메시지를 반환합니다.

### `POST /api/recommend`

자유 텍스트 설명을 받아 AI가 업체 목록 중 최대 3곳을 추천합니다. 로그인이 필요하지 않습니다.

```json
{ "message": "강아지와 함께 뛰어놀 수 있는 작은 마당을 서울에 만들고 싶어요" }
```

성공 시 `recommendations` 배열(각 항목은 `company`, `reason`)을 반환합니다. `message`가 5자 미만·300자 초과면 `400 VALIDATION_ERROR`, `OPENAI_API_KEY`가 없으면 `503 AI_UNAVAILABLE`, OpenAI 호출이 실패하면 `502 AI_UPSTREAM_ERROR`를 반환합니다.

## 빌드와 실행

```bash
npm run lint
npm run build
npm start
```

`npm run build`는 프론트 정적 파일을 `dist`, 번들된 서버를 `dist-server`에 생성합니다. 운영 서버는 API와 SPA 정적 파일을 같은 프로세스에서 제공합니다.

## Render 배포

저장소 루트의 `render.yaml`을 Render Blueprint로 연결합니다.

1. Render Dashboard에서 **New Blueprint Instance**를 선택합니다.
2. 이 Git 저장소를 연결합니다.
3. `DEMO_USER_PASSWORD` 값을 입력합니다.
4. AI 추천 기능을 쓰려면 `OPENAI_API_KEY`도 입력합니다(비워 두면 해당 기능만 비활성화됩니다).
5. 배포 후 실제 서비스 주소에 맞춰 `ALLOWED_ORIGINS`를 확인합니다.
6. `/api/health`가 `200`을 반환하는지 확인합니다.

무료(Free) 플랜은 결제 수단 없이 배포할 수 있지만 영속 디스크를 지원하지 않으므로, 등록한 업체 데이터는 컨테이너 파일시스템에 저장되어 재배포·재시작 시 초기화됩니다. 데이터를 영구 보존하려면 유료 플랜과 디스크(또는 별도 DB)로 전환해야 합니다.

**Cold Start 안내**: Render 무료 플랜은 공식적으로 15분간 요청이 없으면 인스턴스가 절전 모드로 전환되고, 다음 요청이 최대 50초 이상 지연될 수 있습니다. 다만 이 프로젝트는 `render.yaml`에 `healthCheckPath: /api/health`를 지정해 두었는데, Render가 이 경로를 주기적으로 자체 폴링하면서 그 트래픽 자체가 활동으로 간주되어 실제로는 절전 모드로 잘 전환되지 않는 것을 확인했습니다(2026-09-03 기준: 실사용 요청 없이 16분 방치 후에도 응답 지연 없음(약 350~410ms), Render Events 로그에도 spin-down 이벤트 없음). 그렇다고 절전 모드 자체가 비활성화된 것은 아니므로, 정말 오랫동안(예: 몇 시간 이상) 아무 요청도 없었다면 첫 접속 시 지연이 발생할 수 있습니다. 응답 지연을 완전히 없애려면 유료 플랜으로 전환해야 합니다.

실제 배포 주소가 `https://we-green.onrender.com`과 다르면 `ALLOWED_ORIGINS` 환경 변수를 실제 주소로 변경해야 합니다. 프론트엔드를 다른 도메인(예: Vercel)에 배포했다면, 그 프론트 도메인도 `ALLOWED_ORIGINS`에 포함하고 프론트엔드의 `VITE_API_BASE_URL`을 이 Render 주소로 설정합니다.
