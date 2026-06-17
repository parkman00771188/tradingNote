function renderAssets() {
  const portfolioSegments = [
    { label: "국내 주식", value: 58.3, amount: "26,630,000원", color: "#2474f2" },
    { label: "해외 주식", value: 24.7, amount: "11,280,000원", color: "#22c55e" },
    { label: "ETF", value: 10.5, amount: "4,790,000원", color: "#8b5cf6" },
    { label: "현금", value: 6.5, amount: "2,980,000원", color: "#f79009" }
  ];
  return `
    <div class="stack">
      <section class="metric-grid">
        ${metricCard({ title: "총자산", value: "45,680,000원", sub: `<span>전일 대비</span><strong class="text-blue">+620,000원 (+1.37%)</strong>`, iconName: "wallet", info: true, className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
        ${metricCard({ title: "현금비중", value: "18.6%", sub: `<span>8,480,000원</span>`, iconName: "coin", className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
        ${metricCard({ title: "평가손익", value: "+5,680,000원", sub: `<strong class="text-green">+14.20%</strong>`, iconName: "trend", tone: "green", valueClass: "text-green", className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
        ${metricCard({ title: "실현손익", value: "+1,250,000원", sub: `<strong class="text-green">+3.21%</strong>`, iconName: "target", tone: "green", valueClass: "text-green", className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
      </section>

      <section class="asset-grid">
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">포트폴리오 구성</h2></div>
          <div class="donut-row">
            ${donutChart(portfolioSegments, "총 자산<br><strong>45,680,000원</strong>")}
            <div class="portfolio-legend">
              ${portfolioSegments.map((item) => `
                <div class="legend-row"><span><i class="dot" style="background:${item.color}"></i>${item.label}</span><strong>${item.value}%</strong><span>${item.amount}</span></div>
              `).join("")}
            </div>
          </div>
          <p class="footer-note">기준: 2024.06.20</p>
        </article>
        <article class="panel">
          <div class="panel-header"><h2 class="panel-title">섹터 비중 <small>국내 주식 기준</small></h2><button class="btn ghost" type="button">더보기 ${icon("chevronRight")}</button></div>
          <div class="bar-list">
            ${[
              ["IT", "28.4%", 88],
              ["금융", "16.7%", 58],
              ["산업재", "12.3%", 44],
              ["소비재", "11.5%", 40],
              ["헬스케어", "9.8%", 31],
              ["에너지", "6.2%", 24],
              ["기타", "15.1%", 47]
            ].map(([name, rate, width]) => `<div class="bar-row"><span>${name}</span><div class="bar-track"><span class="bar-fill" style="width:${width}%"></span></div><strong>${rate}</strong></div>`).join("")}
          </div>
        </article>
        <article class="panel">
          <div class="panel-header"><h2 class="panel-title">목표 자산 배분</h2><button class="mini-action" type="button">${icon("edit")}</button></div>
          <div class="bar-list">
            ${[
              ["국내 주식", "60%", "58.3%", 58.3, "#2474f2"],
              ["해외 주식", "25%", "24.7%", 24.7, "#22c55e"],
              ["ETF", "10%", "10.5%", 10.5, "#8b5cf6"],
              ["현금", "5%", "6.5%", 6.5, "#0ea5e9"]
            ].map(([name, target, now, width, color]) => `
              <div class="legend-row"><span><i class="dot" style="background:${color}"></i>${name}</span><span>${target}</span><div class="progress-bar"><span class="progress-track"><span class="progress-fill" style="width:${width}%;background:${color}"></span></span><strong>${now}</strong></div></div>
            `).join("")}
          </div>
          <p class="footer-note">기준: 목표 대비 현재 비중</p>
        </article>
      </section>

      <section class="asset-mid-grid">
        <article class="panel">
          <div class="panel-header"><h2 class="panel-title">계좌별 현황</h2><button class="btn ghost" type="button">더보기 ${icon("chevronRight")}</button></div>
          <div class="list">
            <div class="list-row"><span class="list-icon">${icon("wallet")}</span><div><p class="list-title">주식 계좌</p><p class="list-sub">+1.25%</p></div><strong>32,450,000원</strong></div>
            <div class="list-row"><span class="list-icon" style="color:var(--purple);background:var(--purple-soft)">${icon("wallet")}</span><div><p class="list-title">연금 계좌</p><p class="list-sub">+0.85%</p></div><strong>13,230,000원</strong></div>
          </div>
        </article>
        <article class="panel">
          <div class="panel-header"><h2 class="panel-title">자산 추이</h2><div class="segmented"><button type="button">1M</button><button type="button">3M</button><button type="button">6M</button><button class="active" type="button">YTD</button><button type="button">1Y</button><button type="button">전체</button></div></div>
          ${lineChart({
            primary: [26, 28, 29, 31, 34, 39, 37, 41, 40, 43, 41, 42, 44, 45.68],
            secondary: [24, 24, 25, 26, 27, 27, 29, 30, 30, 31, 32, 32, 33, 34],
            min: 0,
            max: 60,
            unit: "M",
            labels: ["01/02", "02/01", "03/01", "04/01", "05/02", "06/01"],
            endPrimary: "45.68M",
            endSecondary: ""
          })}
        </article>
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">국내 vs 해외 비중</h2></div>
          <div class="donut-row asset-compact-donut">
            ${donutChart([{ value: 58.3, color: "#2474f2" }, { value: 24.7, color: "#22c55e" }, { value: 17, color: "#83b8ff" }], "", true)}
            <div class="portfolio-legend">
              <div class="legend-row"><span><i class="dot"></i>국내</span><strong>58.3%</strong></div>
              <div class="legend-row"><span><i class="dot green"></i>해외</span><strong>24.7%</strong></div>
              <div class="legend-row"><span><i class="dot gray"></i>기타</span><strong>17.0%</strong></div>
            </div>
          </div>
          <p class="footer-note">기준: 2024.06.20</p>
        </article>
      </section>

      <section class="journal-layout">
        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">보유 종목 상세</h2>
            <div class="header-actions"><span class="tiny">평가 기준</span><select class="select" style="width:120px"><option>현재가</option></select><button class="mini-action" type="button">${icon("download")}</button></div>
          </div>
          ${renderTable(["종목명", "수량", "평균단가", "현재가", "평가손익", "수익률", "비중"], [
            ["삼성전자", "50", "81,500", "81,500", "0", "0.00%", "9.0%"],
            ["SK하이닉스", "20", "126,000", "128,000", `<span class="text-blue">+40,000</span>`, `<span class="text-blue">+1.59%</span>`, "5.6%"],
            ["NAVER", "10", "178,000", "187,500", `<span class="text-blue">+95,000</span>`, `<span class="text-blue">+5.34%</span>`, "4.1%"],
            ["카카오", "15", "52,100", "54,300", `<span class="text-blue">+33,000</span>`, `<span class="text-blue">+4.22%</span>`, "3.6%"],
            ["TIGER 200", "30", "12,450", "12,830", `<span class="text-blue">+11,400</span>`, `<span class="text-blue">+3.05%</span>`, "2.8%"]
          ])}
        </article>
        <aside class="panel">
          <div class="panel-header"><h2 class="panel-title">리밸런싱 알림</h2><button class="btn ghost" type="button">더보기 ${icon("chevronRight")}</button></div>
          <div class="list">
            ${[
              ["해외 주식 비중 초과", "목표(25%) 대비 +1.2% 초과", "조정 제안 비중: 23.8%", "orange"],
              ["현금 비중 초과", "목표(5%) 대비 +1.5% 초과", "조정 제안 비중: 4.2%", "orange"],
              ["IT 섹터 비중 초과", "목표(25%) 대비 +3.4% 초과", "조정 제안 비중: 25.0%", "blue"]
            ].map(([title, sub, desc, tone]) => `
              <div class="list-row"><span class="status-icon ${tone}">${icon("info")}</span><div><p class="list-title">${title}</p><p class="list-sub">${sub}</p><p class="list-sub">${desc}</p></div><span class="tiny">06/20</span></div>
            `).join("")}
          </div>
          <button class="btn ghost full" type="button">리밸런싱 가이드 보기 ${icon("chevronRight")}</button>
        </aside>
      </section>
    </div>
  `;
}
