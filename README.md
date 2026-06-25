# 주식 매매 일지 UI

정적 HTML/CSS/JavaScript로 구성된 대시보드형 웹앱입니다. 별도 빌드 도구 없이 `index.html`을 브라우저에서 열면 실행됩니다.

## 구조

- `index.html`: 앱 진입점, 사이드바/상단바/스크립트 로드 순서 관리
- `styles.css`: CSS 레이어 import 전용 진입점
- `src/css/base.css`: 색상 토큰, 리셋, 기본 타이포그래피
- `src/css/layout.css`: 앱 쉘, 사이드바, 상단바, 내비게이션
- `src/css/components.css`: 카드, 버튼, 폼, 표, 차트, 태그 등 공통 UI
- `src/css/responsive.css`: 화면 폭별 반응형 보정
- `src/js/core`: 아이콘, 데이터, 차트, 표, 공통 UI 헬퍼
- `src/js/pages`: 페이지별 렌더러
- `src/js/app.js`: 라우팅, 이벤트 바인딩, 초기 렌더

## 페이지 수정 위치

- 대시보드: `src/js/pages/dashboard.js`
- 매매 일지: `src/js/pages/journal.js`
- 매매 일지 작성: `src/js/pages/journal-write.js`
- 종목 분석: `src/js/pages/stock.js`
- 성과 분석: `src/js/pages/performance.js`
- 자산 현황: `src/js/pages/assets.js`
- 메모: `src/js/pages/memo.js`
- 캘린더: `src/js/pages/calendar.js`
- 설정: `src/js/pages/settings.js`

## Google 로그인 / Cloudflare Pages 설정

실제 Google 로그인은 Cloudflare Pages Functions에서 처리합니다.

1. Google Cloud Console에서 OAuth 2.0 웹 클라이언트를 만들고 승인된 JavaScript 원본에 배포 도메인을 추가합니다.
   - 배포: `https://tradingnote.pages.dev`
   - 로컬 Pages Functions 개발 시: `http://127.0.0.1:4173`, `http://localhost:4173`
   - 현재 로그인은 popup 방식이라 승인된 리디렉션 URI는 필요하지 않습니다.
2. Cloudflare KV namespace를 만들고 Pages 프로젝트에 `USERS_KV` 이름으로 바인딩합니다. 이 저장소는 `wrangler.toml`에서 `USERS_KV` 바인딩을 관리합니다.
3. Cloudflare Pages 프로젝트 환경변수/secret에 아래 값을 설정합니다.
   - `GOOGLE_CLIENT_ID`: Google OAuth 웹 클라이언트 ID
   - `AUTH_ENCRYPTION_KEY`: 사용자 정보 암호화용 긴 랜덤 secret
   - `AUTH_SESSION_SECRET`: 세션 쿠키 서명용 긴 랜덤 secret
   - `GOOGLE_HOSTED_DOMAIN`: 선택 사항, 특정 Google Workspace 도메인만 허용할 때 사용
4. 로컬에서 Functions까지 테스트하려면 `.dev.vars.example`을 `.dev.vars`로 복사해 값을 채우고 Wrangler로 실행합니다.

```bash
npx wrangler pages dev . --port 4173
```

배포는 Cloudflare Pages 프로젝트(`tradingnote`)에 직접 업로드합니다.

```bash
npx wrangler pages deploy . --project-name tradingnote --branch main
```

Google 로그인 성공 시 서버가 Google ID 토큰을 검증하고, 사용자 프로필은 KV에 AES-GCM으로 암호화 저장됩니다. 브라우저에는 HttpOnly 세션 쿠키만 내려갑니다.
