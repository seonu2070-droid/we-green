# WE:GREEN

지역 조경업체를 조회하고, 로그인한 파트너가 업체를 등록할 수 있는 풀스택 MVP입니다.

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
4. 배포 후 실제 서비스 주소에 맞춰 `ALLOWED_ORIGINS`를 확인합니다.
5. `/api/health`가 `200`을 반환하는지 확인합니다.

무료(Free) 플랜은 결제 수단 없이 배포할 수 있지만 영속 디스크를 지원하지 않으므로, 등록한 업체 데이터는 컨테이너 파일시스템에 저장되어 재배포·재시작 시 초기화됩니다. 또한 일정 시간 요청이 없으면 인스턴스가 절전 모드로 전환되어 다음 요청의 응답이 느릴 수 있습니다(Cold Start). 데이터를 영구 보존하려면 유료 플랜과 디스크(또는 별도 DB)로 전환해야 합니다.

실제 배포 주소가 `https://we-green.onrender.com`과 다르면 `ALLOWED_ORIGINS` 환경 변수를 실제 주소로 변경해야 합니다. 프론트엔드를 다른 도메인(예: Vercel)에 배포했다면, 그 프론트 도메인도 `ALLOWED_ORIGINS`에 포함하고 프론트엔드의 `VITE_API_BASE_URL`을 이 Render 주소로 설정합니다.
