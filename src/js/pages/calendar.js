function renderCalendar() {
  const mobileCalendarDays = [
    ["26", "+50K", "red", true], ["27", "-26K", "blue", true], ["28", "+15K", "red", true], ["29", "-30K", "blue", true], ["30", "+65K", "red", true], ["31", "-8K", "blue", true], ["1", "0", "", false],
    ["2", "-110K", "blue", false], ["3", "+120K", "red", false], ["4", "+320K", "red", false], ["5", "+85K", "", false], ["6", "-210K", "blue", false], ["7", "+60K", "red", false], ["8", "0", "", false],
    ["9", "-75K", "blue", false], ["10", "+160K", "red", false], ["11", "-180K", "blue", false], ["12", "+240K", "red", false], ["13", "-90K", "blue", false], ["14", "+70K", "red", false], ["15", "0", "", false],
    ["16", "+520K", "red", false], ["17", "-230K", "blue", false], ["18", "+65K", "red", false], ["19", "-90K", "blue", false], ["20", "+125K", "red", false, true], ["21", "+90K", "red", false], ["22", "0", "", false],
    ["23", "0", "red", false], ["24", "0", "", false], ["25", "0", "", false], ["26", "0", "", false], ["27", "0", "", false], ["28", "0", "", false], ["29", "0", "", false],
    ["30", "", "red", false], ["1", "", "", true], ["2", "", "", true], ["3", "", "", true], ["4", "", "", true], ["5", "", "", true], ["6", "", "", true]
  ];
  const days = [
    ["26", "", "", true], ["27", "", "", true], ["28", "", "", true], ["29", "", "", true], ["30", "", "", true], ["31", "", "", true], ["1", "", "", false],
    ["2", "-120,000원", "rr", false], ["3", "+320,000원", "bbb", false], ["4", "+85,000원", "b", false], ["5", "-210,000원", "rrr", false], ["6", "현충일", "", false], ["7", "+450,000원", "bbb", false], ["8", "", "", false],
    ["9", "-75,000원", "r", false], ["10", "+610,000원", "bbb", false], ["11", "-180,000원", "r", false], ["12", "+240,000원", "bb", false], ["13", "-90,000원", "r", false], ["14", "+130,000원", "b", false], ["15", "", "", false],
    ["16", "", "", false], ["17", "+520,000원", "bb", false], ["18", "-230,000원", "rr", false], ["19", "+65,000원", "b", false], ["20", "+125,000원", "bbb", false, true], ["21", "", "", false], ["22", "", "", false],
    ["23", "", "", false], ["24", "", "", false], ["25", "", "", false], ["26", "", "", false], ["27", "", "", false], ["28", "", "", false], ["29", "", "", false],
    ["30", "", "", false], ["1", "", "", true], ["2", "", "", true], ["3", "", "", true], ["4", "", "", true], ["5", "", "", true], ["6", "", "", true]
  ];
  return `
    <div class="mobile-calendar-page">
      <div class="mobile-month-nav">
        <button type="button">${icon("chevronLeft")}</button>
        <h2>2024년 6월</h2>
        <button type="button">${icon("chevronRight")}</button>
      </div>
      <section class="mobile-calendar-card">
        ${["일", "월", "화", "수", "목", "금", "토"].map((day, index) => `<strong class="${index === 0 ? "text-red" : index === 6 ? "text-blue" : ""}">${day}</strong>`).join("")}
        ${mobileCalendarDays.map(([date, amount, tone, muted, selected], index) => `
          <div class="${muted ? "muted" : ""} ${index % 7 === 0 ? "sunday" : ""} ${selected ? "selected" : ""}">
            <span>${date}</span>
            <em class="${tone === "red" ? "text-red" : tone === "blue" ? "text-blue" : ""}">${amount}</em>
          </div>
        `).join("")}
      </section>
      <section class="panel mobile-month-summary">
        <h2 class="panel-title">이번 달 요약</h2>
        <div>
          <span><em>총 수익</em><strong class="text-red">+2,450,000원</strong></span>
          <span><em>총 손실</em><strong class="text-blue">-1,335,000원</strong></span>
          <span><em>순수익</em><strong class="text-red">+1,115,000원</strong></span>
          <span><em>거래일 수</em><strong>14일</strong></span>
          <span><em>승률</em><strong>64.3%</strong></span>
        </div>
      </section>
      <section class="panel mobile-event-list">
        <div class="panel-header"><h2 class="panel-title">예정 이벤트</h2><button class="btn ghost" type="button">더보기</button></div>
        ${[
          ["06/25 (화)", "엔비디아 (NVDA) 실적 발표"],
          ["06/27 (목)", "나이키 (NKE) 실적 발표"],
          ["06/28 (금)", "개인소비지출 (PCE) 발표"]
        ].map(([date, title]) => `
          <div class="mobile-event-row"><span>${icon("calendar")}</span><div><em>${date}</em><strong>${title}</strong></div>${icon("chevronRight")}</div>
        `).join("")}
      </section>
    </div>

    <div class="calendar-layout desktop-calendar-layout">
      <div class="stack">
        <div class="calendar-top">
          <button class="icon-button" type="button">${icon("chevronLeft")}</button>
          <button class="icon-button" type="button">${icon("chevronLeft")}</button>
          <h2 class="month-title">2024년 6월</h2>
          <button class="icon-button" type="button">${icon("chevronRight")}</button>
          <button class="btn ghost" type="button">오늘</button>
        </div>
        <section class="calendar-grid">
          ${["일", "월", "화", "수", "목", "금", "토"].map((day, i) => `<div class="calendar-head ${i === 0 ? "text-red" : i === 6 ? "text-blue" : ""}">${day}</div>`).join("")}
          ${days.map(([date, profit, dots, muted, selected], index) => {
            const isSunday = index % 7 === 0;
            return `
              <div class="calendar-cell ${muted ? "muted-day" : ""} ${isSunday ? "sunday" : ""} ${selected ? "selected" : ""}">
                <span class="date-num">${date}</span>
                ${profit ? `<div class="day-profit ${profit.startsWith("+") ? "text-red" : profit.startsWith("-") ? "text-blue" : "text-red"}">${profit}</div>` : ""}
                ${dots ? `<div class="day-dots">${dots.split("").map((dot) => `<span class="${dot === "r" ? "blue" : ""}"></span>`).join("")}</div>` : ""}
              </div>
            `;
          }).join("")}
        </section>
        <section class="bottom-grid">
          <article class="panel">
            <div class="panel-header tight"><h2 class="panel-title">6월 20일 (목) 거래 내역</h2></div>
            <div class="panel-header tight"><span>총 수익 <strong class="text-red">+125,000원</strong></span><span>총 손실 <strong class="text-blue">0원</strong></span><span>순수익 <strong class="text-red">+125,000원</strong></span></div>
            ${renderTable(["종목명", "거래구분", "수량", "매수가", "매도가", "실현손익"], [
              ["삼성전자", `<span class="text-red">매수</span>`, "10", "81,500", "83,000", `<span class="text-red">+15,000</span>`],
              ["SK하이닉스", `<span class="text-blue">매도</span>`, "5", "126,000", "128,500", `<span class="text-red">+12,500</span>`],
              ["카카오", `<span class="text-red">매수</span>`, "5", "57,700", "58,900", `<span class="text-red">+6,000</span>`],
              ["현대차", `<span class="text-blue">매도</span>`, "10", "169,000", "174,000", `<span class="text-red">+50,000</span>`],
              ["NAVER", `<span class="text-red">매수</span>`, "3", "178,000", "180,500", `<span class="text-red">+7,500</span>`]
            ])}
          </article>
          <article class="panel">
            <div class="panel-header tight"><h2 class="panel-title">당일 수익 추이</h2></div>
            <p>총 수익 <strong class="text-red">+125,000원</strong> <span class="text-red">(+1.28%)</span></p>
            ${miniLineChart([-110000, -68000, -76000, -22000, -36000, 12000, -3000, 21000, 18000, 52000, 74000, 98000, 86000, 125000])}
          </article>
        </section>
      </div>

      <aside class="side-card">
        <article class="panel">
          <div class="panel-header"><h2 class="panel-title">이번 달 요약</h2><button class="btn ghost" type="button">상세 보기 ${icon("chevronRight")}</button></div>
          <div class="summary-grid">
            <div class="summary-item"><p>총 수익</p><strong class="text-red">+2,450,000원</strong></div>
            <div class="summary-item"><p>총 손실</p><strong class="text-blue">-1,335,000원</strong></div>
            <div class="summary-item"><p>순수익</p><strong class="text-red">+1,115,000원</strong></div>
            <div class="summary-item"><p>거래일 수</p><strong>14일</strong></div>
            <div class="summary-item"><p>승률</p><strong>64.3%</strong></div>
            <div class="summary-item"><p>총 거래 횟수</p><strong>42회</strong></div>
          </div>
        </article>
        <article class="panel">
          <div class="panel-header"><h2 class="panel-title">예정된 기업 실적 / 이벤트</h2><button class="btn ghost" type="button">더보기 ${icon("chevronRight")}</button></div>
          <div class="list">
            <div class="list-row"><span class="status-icon purple">${icon("calendar")}</span><p class="list-title">06/25 (화) 엔비디아 (NVDA) 실적 발표</p><span></span></div>
            <div class="list-row"><span class="status-icon red">${icon("calendar")}</span><p class="list-title">06/27 (목) 나이키 (NKE) 실적 발표</p><span></span></div>
            <div class="list-row"><span class="status-icon green">${icon("calendar")}</span><p class="list-title">06/28 (금) 개인소비지출 (PCE) 발표</p><span></span></div>
          </div>
        </article>
        <article class="panel">
          <div class="panel-header"><h2 class="panel-title">경제지표 일정</h2><button class="btn ghost" type="button">더보기 ${icon("chevronRight")}</button></div>
          <div class="list">
            <div class="list-row"><span class="status-icon">${icon("calendar")}</span><p class="list-title">06/21 (금) 미국 PMI 예비치</p><span></span></div>
            <div class="list-row"><span class="status-icon">${icon("calendar")}</span><p class="list-title">06/25 (화) 미국 CB 소비자신뢰지수</p><span></span></div>
            <div class="list-row"><span class="status-icon purple">${icon("calendar")}</span><p class="list-title">06/28 (금) 미국 PCE 물가지수</p><span></span></div>
          </div>
        </article>
        <article class="panel">
          <div class="panel-header"><h2 class="panel-title">알림</h2><button class="btn ghost" type="button">설정 ${icon("chevronRight")}</button></div>
          <div class="list">
            <div class="list-row"><span class="status-icon">${icon("bell")}</span><p class="list-title">06/20 (목) 09:30 삼성전자 목표가 도달</p><span></span></div>
            <div class="list-row"><span class="status-icon orange">${icon("bell")}</span><p class="list-title">06/20 (목) 09:15 카카오 신규 매수 알림</p><span></span></div>
            <div class="list-row"><span class="status-icon red">${icon("bell")}</span><p class="list-title">06/19 (수) 16:10 NAVER 손절가 도달</p><span></span></div>
          </div>
        </article>
      </aside>
    </div>
  `;
}
