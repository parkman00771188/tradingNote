function renderProfileInfoItem(iconName, label, value, description = "") {
  return `
    <article class="settings-profile-info-item">
      <span class="settings-profile-info-icon">${icon(iconName)}</span>
      <div>
        <span>${label}</span>
        <strong>${escapeHtml(value)}</strong>
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
      </div>
    </article>
  `;
}

function renderSettings() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const name = typeof getUserDisplayName === "function" ? getUserDisplayName(user) : user?.name || "투자자";
  const email = typeof getUserEmail === "function" ? getUserEmail(user) : user?.email || "Google 계정";
  const avatar = typeof renderUserAvatar === "function"
    ? renderUserAvatar(user, "settings-profile-avatar")
    : `<span class="settings-profile-avatar" aria-hidden="true">${escapeHtml(String(name || "T").slice(0, 1).toUpperCase())}</span>`;

  return `
    <div class="settings-page settings-profile-page">
      <section class="panel settings-profile-hero">
        <div class="settings-profile-main">
          ${avatar}
          <div class="settings-profile-copy">
            <span>프로필</span>
            <h2>${escapeHtml(name)}</h2>
            <p>${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="settings-profile-action-row">
          <span class="settings-profile-provider">${icon("shield")}Google 계정으로 로그인됨</span>
          <button class="btn ghost settings-profile-logout" type="button" data-auth-logout>로그아웃</button>
        </div>
      </section>

      <section class="settings-profile-info-grid" aria-label="프로필 정보">
        ${renderProfileInfoItem("user", "이름", name, "서비스 안에서 표시되는 사용자 이름입니다.")}
        ${renderProfileInfoItem("memo", "이메일", email, "로그인과 데이터 저장 기준이 되는 계정입니다.")}
        ${renderProfileInfoItem("cloud", "데이터 저장", "계정 전용 저장소", "로그인한 계정 기준으로 투자 기록을 불러옵니다.")}
      </section>
    </div>
  `;
}
