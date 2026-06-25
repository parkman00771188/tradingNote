function renderPerformance() {
  if (typeof trades !== "undefined" && !trades.length) {
    return `
      <div class="stack">
        <article class="panel empty-state">
          <span class="status-icon">${icon("performance")}</span>
          <div>
            <strong>성과 데이터가 없습니다.</strong>
            <p>매매 기록을 저장하면 이 계정의 성과 분석이 표시됩니다.</p>
          </div>
          <button class="btn primary" type="button" data-route="journalWrite">${icon("plus")}매매 기록 작성</button>
        </article>
      </div>
    `;
  }

  return `
    <div class="stack">
      <section class="metric-grid five">
        ${metricCard({ title: "누적수익률", value: "+24.18%", sub: `<span>누적 수익</span><strong class="text-red">+5,680,000원</strong>`, iconName: "trend", tone: "red", valueClass: "text-red", info: true, className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
        ${metricCard({ title: "월간손익", value: "+1,245,000원", sub: `<span>전월 대비</span><strong class="text-red">+620,000원 (+98.4%)</strong>`, iconName: "coin", tone: "red", valueClass: "text-red", info: true, className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
        ${metricCard({ title: "승률", value: "63.6%", sub: `<span>승 63회 / 패 36회</span>`, iconName: "target", className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
        ${metricCard({ title: "평균 보유기간", value: "5.2일", sub: `<span>최대 42일 / 최소 1일</span>`, iconName: "clock", className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
        ${metricCard({ title: "평균 손익비", value: "1.78", sub: `<span>수익 1.78 / 손실 -1.00</span>`, iconName: "balance", tone: "purple", info: true, className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
      </section>

      <section class="performance-grid">
        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">누적 수익 곡선 <span class="tiny">${icon("info")}</span></h2>
            <div class="segmented"><button type="button">1M</button><button type="button">3M</button><button type="button">6M</button><button class="active" type="button">YTD</button><button type="button">1Y</button><button type="button">전체</button></div>
          </div>
          <div class="legend"><span><i class="dot"></i>내 계좌 수익률</span><span><i class="dot gray"></i>KOSPI</span></div>
          ${lineChart({
            primary: [0, 2.1, 6.9, 5.5, 7.2, 8.9, 10.4, 12.8, 15.1, 18.4, 20.2, 22.1, 21.3, 23.2, 24.18],
            secondary: [0, -1.8, 0.4, 2.2, 3.8, 2.1, 4.5, 6.8, 9.1, 3.4, 4.6, 3.2, 5.2, 4.7, 4.15],
            max: 40,
            endPrimary: "+24.18%"
          })}
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">월별 손익 <span class="tiny">${icon("info")}</span></h2></div>
          <p class="tiny">(만원)</p>
          ${barChart([480, 1120, 150, -420, 880, 820], ["1월", "2월", "3월", "4월", "5월", "6월"])}
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">전략별 성과 비교 <span class="tiny">${icon("info")}</span></h2></div>
          ${renderTable(["전략", "수익률", "승률", "손익비"], [
            ["단기 돌파", `<span class="text-red">+32.45%</span>`, "66.7%", "2.05"],
            ["스윙 추세", `<span class="text-red">+18.72%</span>`, "62.1%", "1.64"],
            ["가치 투자", `<span class="text-red">+9.35%</span>`, "58.3%", "1.21"],
            ["역추세", `<span class="text-blue">-2.15%</span>`, "41.2%", "0.73"]
          ])}
        </article>
      </section>

      <section class="performance-lower">
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">요일별 평균 수익률 (%) <span class="tiny">${icon("info")}</span></h2></div>
          <div class="heatmap">
            ${["", "월", "화", "수", "목", "금", "1주", "+0.42", "+0.65", "-0.12", "+0.78", "+1.02", "2주", "+0.31", "-0.08", "+0.22", "+0.55", "+0.91", "3주", "+0.18", "+0.39", "+0.05", "+0.67", "+0.73", "4주", "-0.05", "+0.28", "+0.14", "+0.41", "+0.88", "평균", "+0.21", "+0.22", "+0.08", "+0.55", "+0.83"].map((value, index) => {
              const head = index < 6 || index % 6 === 0;
              const loss = value.startsWith("-");
              const win = value.startsWith("+");
              return `<span class="heat-cell ${head ? "head" : win ? "win" : loss ? "loss" : ""}">${value}</span>`;
            }).join("")}
          </div>
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">매수/매도 성공 비율 <span class="tiny">${icon("info")}</span></h2></div>
          <div class="ratio-panel">
            <div><p class="list-sub"><i class="dot red"></i>매수 성공</p><p class="metric-value">62.6%</p><span class="tiny">62건</span></div>
            ${donutChart([{ value: 62.6, color: "#f04438" }, { value: 64.3, color: "#2474f2" }], "전체<br>99건", true)}
            <div><p class="list-sub"><i class="dot"></i>매도 성공</p><p class="metric-value">64.3%</p><span class="tiny">56건</span></div>
          </div>
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">손실/수익 구간 분포 <span class="tiny">${icon("info")}</span></h2></div>
          <div class="histogram">
            ${[
              ["+10% 이상", 46, "18.2%", ""],
              ["+5% ~ +10%", 58, "22.2%", ""],
              ["+2% ~ +5%", 78, "28.3%", ""],
              ["-2% ~ +2%", 35, "14.1%", ""],
              ["-2% ~ -5%", 22, "9.1%", "blue"],
              ["-5% ~ -10%", 14, "5.1%", "blue"],
              ["-10% 이하", 9, "3.0%", "blue"]
            ].map(([label, width, rate, tone]) => `<div class="hist-row"><span>${label}</span><span class="hist-fill ${tone}" style="width:${width}%"></span><strong>${rate}</strong></div>`).join("")}
          </div>
        </article>
      </section>

      <section class="bottom-grid">
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">최고 수익 거래 TOP 5</h2></div>
          ${renderTable(["종목명", "매수일", "매도가", "수익률", "수익(원)", "보유기간"], [
            ["삼성전자", "06/07", "86,200", `<span class="text-red">+12.35%</span>`, `<span class="text-red">+248,000</span>`, "3일"],
            ["SK하이닉스", "05/28", "198,500", `<span class="text-red">+11.28%</span>`, `<span class="text-red">+212,000</span>`, "5일"],
            ["NAVER", "06/03", "234,000", `<span class="text-red">+9.87%</span>`, `<span class="text-red">+189,000</span>`, "2일"],
            ["카카오", "05/30", "52,800", `<span class="text-red">+8.92%</span>`, `<span class="text-red">+156,000</span>`, "4일"],
            ["현대차", "06/10", "265,500", `<span class="text-red">+8.45%</span>`, `<span class="text-red">+142,000</span>`, "6일"]
          ])}
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">최대 손실 거래 TOP 5</h2></div>
          ${renderTable(["종목명", "매수일", "매도가", "수익률", "손실(원)", "보유기간"], [
            ["에코프로", "05/20", "91,100", `<span class="text-blue">-11.23%</span>`, `<span class="text-blue">-128,000</span>`, "7일"],
            ["셀트리온", "05/16", "166,500", `<span class="text-blue">-8.75%</span>`, `<span class="text-blue">-97,000</span>`, "6일"],
            ["두산에너빌리티", "05/22", "23,850", `<span class="text-blue">-7.62%</span>`, `<span class="text-blue">-74,000</span>`, "4일"],
            ["POSCO홀딩스", "05/13", "352,000", `<span class="text-blue">-6.48%</span>`, `<span class="text-blue">-63,000</span>`, "3일"],
            ["LG화학", "05/09", "435,000", `<span class="text-blue">-5.91%</span>`, `<span class="text-blue">-58,000</span>`, "5일"]
          ])}
        </article>
      </section>
    </div>
  `;
}
