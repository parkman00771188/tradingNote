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
