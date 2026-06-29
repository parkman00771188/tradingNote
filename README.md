# Trading Note

정적 HTML/CSS/JavaScript와 Cloudflare Pages Functions로 구성된 투자 기록 앱입니다.

## 구조

- `index.html`: 앱 진입점
- `styles.css`: CSS 레이어 import 진입점
- `src/css`: 기본 스타일, 레이아웃, 컴포넌트, 반응형 스타일
- `src/js/core`: 아이콘, 데이터, 차트, 테이블, 공통 UI 헬퍼
- `src/js/pages`: 페이지별 렌더러
- `src/js/app.js`: 라우팅, 이벤트 바인딩, 인증/저장 흐름
- `functions/api`: Cloudflare Pages Functions API
- `migrations`: Cloudflare D1 마이그레이션

## Google 로그인

Google 로그인은 Cloudflare Pages Functions에서 Google 토큰을 검증한 뒤 HttpOnly 세션 쿠키를 발급합니다.

필요한 환경 변수:

- `GOOGLE_CLIENT_ID`: Google OAuth 웹 클라이언트 ID
- `AUTH_ENCRYPTION_KEY`: 사용자 정보와 앱 데이터 암호화용 긴 secret
- `AUTH_SESSION_SECRET`: 세션 쿠키 서명용 긴 secret
- `GOOGLE_HOSTED_DOMAIN`: 선택 사항, 특정 Google Workspace 도메인만 허용할 때 사용

Google OAuth 승인된 JavaScript 원본:

```text
https://tradingnote.pages.dev
http://127.0.0.1:4173
http://localhost:4173
http://127.0.0.1:8788
http://localhost:8788
```

Google OAuth 승인된 리디렉션 URI:

```text
https://tradingnote.pages.dev/
```

기본 로그인은 popup/token 방식으로 동작합니다. 일부 모바일/인앱 브라우저에서 Google 인증 스크립트가 차단되면 위 리디렉션 URI를 사용하는 대체 로그인 흐름으로 이어집니다.

## Cloudflare D1 저장소

사용자 프로필과 앱 데이터는 Cloudflare D1에 저장합니다. 저장 전 AES-GCM으로 암호화하므로 D1에는 평문 이메일/자산 데이터가 직접 저장되지 않습니다.
자산 종목명, 종목코드, 수량, 매수평균가 같은 민감한 보유 정보도 `user_data.data_encrypted`에 암호화된 JSON으로만 저장합니다. 브라우저에는 신규 자산 평문 캐시를 남기지 않고, 기존 로컬 평문 캐시가 있으면 D1 저장 성공 후 제거합니다.

현재 바인딩:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tradingnote-db"
database_id = "458d73d9-956c-4d97-af47-c61b8544a757"
```

초기 스키마:

- `app_users`: Google 로그인 사용자 프로필 암호화 저장
- `user_data`: 사용자별 자산/앱 데이터 암호화 저장

마이그레이션 적용:

```bash
npx wrangler d1 migrations apply tradingnote-db --remote
npx wrangler d1 migrations apply tradingnote-db
```

## 로컬 실행

`.dev.vars.example`을 `.dev.vars`로 복사하고 Google/인증 secret 값을 채운 뒤 실행합니다.

```bash
npx wrangler pages dev . --port 8788
```

## 배포

```bash
npx wrangler pages deploy . --project-name tradingnote --branch main
```

Cloudflare Pages의 GitHub 저장소 연동을 사용하는 경우 `main` 브랜치 push만으로 Pages에서 자동 배포됩니다.
이 저장소에는 별도 GitHub Actions 배포 워크플로를 두지 않습니다. GitHub Actions로 직접 배포를 다시 구성할 때만 `CLOUDFLARE_API_TOKEN` 저장소 secret이 필요합니다.
