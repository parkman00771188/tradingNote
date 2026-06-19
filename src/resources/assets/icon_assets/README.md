# Trading Note Icon Assets

투자 기록 앱 UI에 바로 사용할 수 있는 아이콘 에셋입니다.

## 구성

- `svg/default/` : 기본 상태 SVG 아이콘
- `svg/hover/` : mouse hover 상태 SVG 아이콘
- `png/default/128/` : 기본 상태 PNG 128px
- `png/default/256/` : 기본 상태 PNG 256px
- `png/hover/128/` : hover 상태 PNG 128px
- `png/hover/256/` : hover 상태 PNG 256px
- `css/icons.css` : 웹에서 바로 쓸 수 있는 CSS 클래스
- `preview.html` : 아이콘 미리보기 페이지
- `manifest.json` : 파일 경로와 한글 라벨 정리

## CSS 사용 예시

```html
<link rel="stylesheet" href="css/icons.css">
<span class="tn-icon tn-icon-dashboard_home"></span>
```

hover 상태는 CSS에서 자동으로 `svg/hover/` 아이콘으로 교체됩니다.

```css
.tn-icon-dashboard_home:hover {
  background-image: url('../svg/hover/dashboard_home.svg');
}
```

## 아이콘 목록

- 대시보드
- 매매일지
- 종목 분석
- 자산 현황
- 메모
- 캘린더
- 설정
- 리포트(차트)
- 태그 관리
- 데이터 백업
- 리포트(문서)
- 고객센터
- 프로필 아바타
- 내 정보
- 닫기
- 로그아웃
- 알림
- 상단 프로필
- 오른쪽 화살표
- 바텀시트 핸들
