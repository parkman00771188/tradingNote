function renderSettings() {
  return `
    <div class="stack">
      <section class="settings-grid">
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">프로필 정보</h2></div>
          <div class="profile">
            <div><div class="avatar">투자<br>일지</div><button class="btn primary" type="button" style="margin-top:22px">프로필 수정</button></div>
            <div class="list">
              <div><p class="tiny">이름</p><strong>투자일지</strong></div>
              <div><p class="tiny">이메일</p><strong>investor@example.com</strong></div>
              <div><p class="tiny">가입일</p><strong>2023.11.15</strong></div>
            </div>
          </div>
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">계좌/증권사 연동</h2></div>
          <div class="list">
            <div class="broker-row"><span class="broker-logo pink">K</span><strong>키움증권</strong><span>${tag("연동됨", "green")} <button class="btn" type="button">관리</button></span></div>
            <div class="broker-row"><span class="broker-logo">S</span><strong>삼성증권</strong><span>${tag("연동됨", "green")} <button class="btn" type="button">관리</button></span></div>
            <div class="broker-row"><span class="broker-logo dark">M</span><strong>미래에셋증권</strong><span>${tag("연동됨", "green")} <button class="btn" type="button">관리</button></span></div>
          </div>
          <button class="btn ghost full" type="button">${icon("plus")}증권사 계좌 추가</button>
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">기본 통화 및 표시 설정</h2></div>
          <div class="list">
            <div class="field"><label>기본 통화</label><select class="select"><option>KRW (대한민국 원)</option></select></div>
            <div class="field"><label>숫자 표시 형식</label><select class="select"><option>1,234,567</option></select></div>
            <div class="field"><label>수익률 표시 형식</label><select class="select"><option>소수점 2자리 (예: 12.34%)</option></select></div>
            <div class="field"><label>시간대</label><select class="select"><option>(UTC+09:00) 서울</option></select></div>
            <div class="setting-row"><strong>주말 및 공휴일 숨기기</strong><span></span><button class="switch on" type="button" aria-label="주말 및 공휴일 숨기기"></button></div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header"><h2 class="panel-title">거래 태그 관리</h2><button class="mini-action" type="button">${icon("edit")}</button></div>
          <p class="field-label">기본 태그</p>
          <div class="tag-cloud" style="margin:14px 0 24px">
            ${["매수", "매도", "단타", "스윙", "중장기", "성장주", "가치주", "배당주", "ETF", "기타"].map((item) => tag(item, toneForTag(item))).join("")}
          </div>
          <button class="btn ghost full" type="button">${icon("plus")}새 태그 추가</button>
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">알림 설정</h2></div>
          <div class="list">
            <div class="setting-row"><div><strong>매매 체결 알림</strong><p class="list-sub">주문 체결 시 알림을 받습니다.</p></div><span></span><button class="switch on" type="button"></button></div>
            <div class="setting-row"><div><strong>목표가/손절가 알림</strong><p class="list-sub">설정한 가격 도달 시 알림을 받습니다.</p></div><span></span><button class="switch on" type="button"></button></div>
            <div class="setting-row"><div><strong>리포트 알림</strong><p class="list-sub">일간/주간/월간 리포트 준비 시 알림을 받습니다.</p></div><span></span><button class="switch on" type="button"></button></div>
            <div class="field"><label>이메일 요약 리포트</label><select class="select"><option>매주 월요일</option></select></div>
            <div class="setting-row"><div><strong>마케팅 및 업데이트 소식</strong><p class="list-sub">서비스 소식 및 프로모션 안내를 받습니다.</p></div><span></span><button class="switch" type="button"></button></div>
          </div>
        </article>
        ${typeof renderDriveSettingsPanel === "function" ? renderDriveSettingsPanel() : `
          <article class="panel">
            <div class="panel-header tight"><h2 class="panel-title">Google Drive 데이터 저장소</h2></div>
            <p class="list-sub">Drive 연결을 준비하고 있습니다.</p>
          </article>
        `}

        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">보안</h2></div>
          <div class="list">
            <div class="security-row"><div><strong>비밀번호 변경</strong><p class="list-sub">주기적으로 비밀번호를 변경하여 계정을 보호하세요.</p></div><span></span>${icon("chevronRight")}</div>
            <div class="security-row"><div><strong>2단계 인증</strong><p class="list-sub">로그인 시 보안을 강화합니다.</p></div><span></span>${tag("활성", "green")}</div>
            <div class="security-row"><div><strong>로그인 기록</strong><p class="list-sub">최근 로그인 기록을 확인합니다.</p></div><span></span>${icon("chevronRight")}</div>
          </div>
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">테마</h2></div>
          <p class="list-sub">화면 테마를 선택하세요.</p>
          <div class="theme-list">
            <button class="theme-card active" type="button"><div class="theme-preview"></div><strong>라이트</strong></button>
            <button class="theme-card" type="button"><div class="theme-preview dark"></div><strong>다크</strong></button>
            <button class="theme-card" type="button"><div class="theme-preview system"></div><strong>시스템</strong></button>
          </div>
          <p class="field-label" style="margin-top:16px">강조 색상</p>
          <div class="swatches">
            <button class="swatch" style="background:#2474f2" type="button"></button>
            <button class="swatch" style="background:#22c55e" type="button"></button>
            <button class="swatch" style="background:#8b5cf6" type="button"></button>
            <button class="swatch" style="background:#f79009" type="button"></button>
            <button class="swatch" style="background:#ef4444" type="button"></button>
            <button class="swatch" style="background:#0f9f9a" type="button"></button>
          </div>
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">API 연결</h2></div>
          <div class="list">
            <div class="setting-row"><div><strong>API 키</strong><p class="list-sub">외부 서비스와의 연동을 위한 API 키를 관리합니다.</p></div><span></span><button class="btn ghost" type="button">관리</button></div>
            <div class="setting-row"><div><strong>웹훅</strong><p class="list-sub">이벤트 알림을 웹훅으로 수신합니다.</p></div><span></span><button class="btn ghost" type="button">관리</button></div>
            <div class="setting-row"><div><strong>연동된 앱</strong><p class="list-sub">현재 연동된 외부 앱을 확인하고 관리합니다.</p></div><span></span><button class="btn ghost" type="button">관리</button></div>
          </div>
        </article>
      </section>

      <section class="danger-zone">
        <span class="status-icon red">${icon("warning")}</span>
        <div><strong>위험 영역</strong><p>모든 데이터 초기화 · 계정의 모든 데이터가 삭제되며 복구할 수 없습니다. 신중히 진행해주세요.</p></div>
        <button class="btn danger" type="button">데이터 초기화</button>
      </section>
    </div>
  `;
}
