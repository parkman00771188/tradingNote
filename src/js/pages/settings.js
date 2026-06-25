const settingsSections = [
  { id: "profile", label: "프로필", description: "계정 정보 및 프로필 관리", icon: "user" },
  { id: "broker", label: "계좌/증권사 연동", description: "거래 계좌 연결 및 관리", icon: "wallet" },
  { id: "display", label: "통화 및 표시", description: "기본 통화 및 시간, 표시 설정", icon: "coin" },
  { id: "tags", label: "거래 태그 관리", description: "거래 태그 생성 및 관리", icon: "tag" },
  { id: "notifications", label: "알림 설정", description: "이메일 및 앱 알림 설정", icon: "bell" },
  { id: "backup", label: "백업 및 저장", description: "Cloudflare D1 데이터 관리", icon: "cloud" },
  { id: "security", label: "보안", description: "비밀번호 및 2단계 인증 설정", icon: "shield" },
  { id: "theme", label: "테마", description: "앱 테마 및 색상 설정", icon: "eye" },
  { id: "api", label: "API 연동", description: "외부 서비스 및 API 관리", icon: "chart" }
];

function getSettingsActiveSection() {
  const active = typeof settingsActiveSection !== "undefined" ? settingsActiveSection : "broker";
  return settingsSections.some((item) => item.id === active) ? active : "broker";
}

function renderSettingsMenu() {
  const active = getSettingsActiveSection();

  return `
    <nav class="settings-menu" aria-label="설정 메뉴">
      ${settingsSections.map((item) => `
        <button class="settings-menu-item ${active === item.id ? "active" : ""}" type="button" data-settings-section="${item.id}" aria-current="${active === item.id ? "page" : "false"}">
          <span class="settings-menu-icon">${icon(item.icon)}</span>
          <span>
            <strong>${item.label}</strong>
            <em>${item.description}</em>
          </span>
        </button>
      `).join("")}
    </nav>
  `;
}

function renderSettingsPanelHeader(title, description) {
  return `
    <div class="settings-detail-head">
      <h2>${title}</h2>
      <p>${description}</p>
    </div>
  `;
}

function renderSettingsRow({ iconName, title, description, control = "", chevron = false }) {
  return `
    <div class="settings-detail-row">
      <span class="settings-row-icon">${icon(iconName)}</span>
      <div>
        <strong>${title}</strong>
        <p>${description}</p>
      </div>
      <span class="settings-row-control">${control || (chevron ? icon("chevronRight") : "")}</span>
    </div>
  `;
}

function renderProfileSettingsPanel() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const name = typeof getUserDisplayName === "function" ? getUserDisplayName(user) : user?.name || "사용자";
  const email = typeof getUserEmail === "function" ? getUserEmail(user) : user?.email || "Google 계정";
  const avatar = typeof renderUserAvatar === "function"
    ? renderUserAvatar(user, "avatar settings-profile-avatar")
    : `<div class="avatar">${String(name || "T").slice(0, 1).toUpperCase()}</div>`;

  return `
    <section class="panel settings-detail-panel">
      ${renderSettingsPanelHeader("프로필", "로그인 계정과 사용자 표시 정보를 확인합니다.")}
      <div class="settings-profile-card">
        ${avatar}
        <div>
          <strong>${escapeHtml(name)}</strong>
          <p>${escapeHtml(email)}</p>
          <span>이 계정 전용 데이터 저장소를 사용 중입니다.</span>
        </div>
      </div>
    </section>
  `;
}

function renderBrokerSettingsPanel() {
  return `
    <section class="panel settings-detail-panel">
      ${renderSettingsPanelHeader("계좌/증권사 연동", "거래 내역을 자동으로 가져오기 위해 계좌를 연결하세요.")}

      <div class="settings-section-block">
        <h3>연동된 계좌</h3>
        <article class="settings-empty-box">
          <span class="settings-row-icon">${icon("wallet")}</span>
          <div>
            <strong>아직 연결된 계좌가 없습니다.</strong>
            <p>증권사 연동 기능은 준비 중입니다. 지금은 자산 설정과 Cloudflare D1 저장으로 데이터를 관리할 수 있습니다.</p>
          </div>
        </article>
        <button class="settings-add-button" type="button">${icon("plus")}증권사 계좌 추가</button>
      </div>

      <div class="settings-section-block">
        <h3>연동 설정</h3>
        <div class="settings-row-list">
          ${renderSettingsRow({
            iconName: "swap",
            title: "자동 동기화",
            description: "새로운 거래 내역을 자동으로 가져옵니다.",
            control: `<span class="settings-muted-control">매일 09:00 동기화</span><button class="switch on" type="button" aria-label="자동 동기화"></button>`
          })}
          ${renderSettingsRow({
            iconName: "journal",
            title: "거래 내역 가져오기 범위",
            description: "가져올 거래 내역의 기간을 설정합니다.",
            control: `<select class="select settings-inline-select"><option>최근 1년</option><option>최근 6개월</option><option>전체 기간</option></select>`
          })}
          ${renderSettingsRow({
            iconName: "tag",
            title: "가져오기 항목",
            description: "가져올 거래 항목을 선택합니다.",
            control: `<span class="settings-muted-control">주식, ETF, 해외주식</span>${icon("chevronRight")}`
          })}
        </div>
      </div>

      <div class="settings-help-box">
        <span class="status-icon">${icon("info")}</span>
        <div>
          <strong>도움말</strong>
          <p>계좌 연동 기능은 향후 제공 예정입니다. 현재는 자산 설정과 D1 자동 저장을 먼저 사용할 수 있습니다.</p>
        </div>
      </div>
    </section>
  `;
}

function renderDisplaySettingsPanel() {
  return `
    <section class="panel settings-detail-panel">
      ${renderSettingsPanelHeader("통화 및 표시", "금액, 수익률, 시간대 표시 방식을 조정합니다.")}
      <div class="settings-row-list">
        ${renderSettingsRow({ iconName: "coin", title: "기본 통화", description: "대시보드와 자산 화면에서 사용할 통화입니다.", control: `<select class="select settings-inline-select"><option>KRW (대한민국 원)</option></select>` })}
        ${renderSettingsRow({ iconName: "journal", title: "숫자 표시 형식", description: "큰 숫자의 구분 기호 표시 방식을 정합니다.", control: `<select class="select settings-inline-select"><option>1,234,567</option></select>` })}
        ${renderSettingsRow({ iconName: "trend", title: "수익률 표시", description: "수익률의 소수점 자릿수를 정합니다.", control: `<select class="select settings-inline-select"><option>소수점 2자리</option></select>` })}
        ${renderSettingsRow({ iconName: "clock", title: "시간대", description: "날짜와 시간 기준입니다.", control: `<select class="select settings-inline-select"><option>(UTC+09:00) 서울</option></select>` })}
        ${renderSettingsRow({ iconName: "calendar", title: "주말 및 공휴일 숨기기", description: "차트와 캘린더에서 비거래일을 숨깁니다.", control: `<button class="switch on" type="button" aria-label="주말 및 공휴일 숨기기"></button>` })}
      </div>
    </section>
  `;
}

function renderTagSettingsPanel() {
  const tags = ["매수", "매도", "손절", "익절", "중장기", "성장주", "가치주", "배당주", "ETF", "기타"];

  return `
    <section class="panel settings-detail-panel">
      ${renderSettingsPanelHeader("거래 태그 관리", "매매 일지에 사용할 태그를 관리합니다.")}
      <div class="settings-section-block">
        <h3>기본 태그</h3>
        <div class="tag-cloud settings-tag-cloud">${tags.map((item) => tag(item, toneForTag(item))).join("")}</div>
        <button class="settings-add-button" type="button">${icon("plus")}새 태그 추가</button>
      </div>
    </section>
  `;
}

function renderNotificationSettingsPanel() {
  return `
    <section class="panel settings-detail-panel">
      ${renderSettingsPanelHeader("알림 설정", "매매와 리포트 관련 알림을 관리합니다.")}
      <div class="settings-row-list">
        ${renderSettingsRow({ iconName: "bell", title: "매매 체결 알림", description: "주문 체결 시 알림을 받습니다.", control: `<button class="switch on" type="button"></button>` })}
        ${renderSettingsRow({ iconName: "target", title: "목표가/손절가 알림", description: "설정한 가격 도달 시 알림을 받습니다.", control: `<button class="switch on" type="button"></button>` })}
        ${renderSettingsRow({ iconName: "report", title: "리포트 알림", description: "일간/주간/월간 리포트 준비 시 알림을 받습니다.", control: `<button class="switch on" type="button"></button>` })}
        ${renderSettingsRow({ iconName: "memo", title: "이메일 요약 리포트", description: "리포트 수신 주기를 설정합니다.", control: `<select class="select settings-inline-select"><option>매주 월요일</option></select>` })}
        ${renderSettingsRow({ iconName: "info", title: "마케팅 및 업데이트 소식", description: "서비스 소식 및 업데이트 안내를 받습니다.", control: `<button class="switch" type="button"></button>` })}
      </div>
    </section>
  `;
}

function renderBackupSettingsPanel() {
  return typeof renderDatabaseSettingsPanel === "function"
    ? renderDatabaseSettingsPanel()
    : `
      <section class="panel settings-detail-panel">
        ${renderSettingsPanelHeader("백업 및 저장", "Cloudflare D1 데이터 저장소를 관리합니다.")}
        <p class="list-sub">D1 저장소 상태를 확인하고 있습니다.</p>
      </section>
    `;
}

function renderSecuritySettingsPanel() {
  return `
    <section class="panel settings-detail-panel">
      ${renderSettingsPanelHeader("보안", "계정 접근과 보안 상태를 확인합니다.")}
      <div class="settings-row-list">
        ${renderSettingsRow({ iconName: "shield", title: "Google 로그인", description: "현재 Google OAuth로 로그인합니다.", control: tag("활성", "green") })}
        ${renderSettingsRow({ iconName: "clock", title: "최근 로그인 기록", description: "최근 로그인 세션을 확인합니다.", chevron: true })}
        ${renderSettingsRow({ iconName: "trash", title: "데이터 초기화", description: "이 계정의 저장 데이터를 삭제합니다.", control: `<button class="btn danger" type="button">초기화</button>` })}
      </div>
    </section>
  `;
}

function renderThemeSettingsPanel() {
  return `
    <section class="panel settings-detail-panel">
      ${renderSettingsPanelHeader("테마", "화면 테마와 강조 색상을 선택합니다.")}
      <div class="theme-list settings-theme-list">
        <button class="theme-card active" type="button"><div class="theme-preview"></div><strong>라이트</strong></button>
        <button class="theme-card" type="button"><div class="theme-preview dark"></div><strong>다크</strong></button>
        <button class="theme-card" type="button"><div class="theme-preview system"></div><strong>시스템</strong></button>
      </div>
      <p class="field-label" style="margin-top:18px">강조 색상</p>
      <div class="swatches">
        <button class="swatch" style="background:#2474f2" type="button"></button>
        <button class="swatch" style="background:#22c55e" type="button"></button>
        <button class="swatch" style="background:#8b5cf6" type="button"></button>
        <button class="swatch" style="background:#f79009" type="button"></button>
        <button class="swatch" style="background:#ef4444" type="button"></button>
        <button class="swatch" style="background:#0f9f9a" type="button"></button>
      </div>
    </section>
  `;
}

function renderApiSettingsPanel() {
  return `
    <section class="panel settings-detail-panel">
      ${renderSettingsPanelHeader("API 연동", "외부 서비스와의 연동 상태를 관리합니다.")}
      <div class="settings-row-list">
        ${renderSettingsRow({ iconName: "settings", title: "API 키", description: "외부 서비스와 연동할 API 키를 관리합니다.", control: `<button class="btn ghost" type="button">관리</button>` })}
        ${renderSettingsRow({ iconName: "swap", title: "웹훅", description: "이벤트 알림을 웹훅으로 수신합니다.", control: `<button class="btn ghost" type="button">관리</button>` })}
        ${renderSettingsRow({ iconName: "cloud", title: "연동된 앱", description: "현재 연결된 외부 앱을 확인합니다.", control: `<button class="btn ghost" type="button">관리</button>` })}
      </div>
    </section>
  `;
}

function renderSettingsContent() {
  const section = getSettingsActiveSection();
  if (section === "profile") return renderProfileSettingsPanel();
  if (section === "display") return renderDisplaySettingsPanel();
  if (section === "tags") return renderTagSettingsPanel();
  if (section === "notifications") return renderNotificationSettingsPanel();
  if (section === "backup") return renderBackupSettingsPanel();
  if (section === "security") return renderSecuritySettingsPanel();
  if (section === "theme") return renderThemeSettingsPanel();
  if (section === "api") return renderApiSettingsPanel();
  return renderBrokerSettingsPanel();
}

function renderSettings() {
  return `
    <div class="settings-page">
      <aside class="settings-side">
        ${renderSettingsMenu()}
      </aside>
      <div class="settings-content">
        ${renderSettingsContent()}
      </div>
    </div>
  `;
}
