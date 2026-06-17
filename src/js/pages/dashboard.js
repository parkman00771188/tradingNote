var dashboardHoldingsView = "amount";

function parseDashboardNumber(value) {
  return Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
}

function renderDashboardHoldingRows() {
  const sortIndex = dashboardHoldingsView === "rate" ? 4 : 2;
  return holdings
    .slice()
    .sort((a, b) => parseDashboardNumber(b[sortIndex]) - parseDashboardNumber(a[sortIndex]))
    .slice(0, 5)
    .map((row) =>
      row.map((cell, index) => index === 3 || index === 4 ? `<span class="${cell.startsWith("+") ? "text-red" : "text-blue"}">${cell}</span>` : cell)
    );
}

function renderDashboard() {
  const dashboardPortfolio = [
    { label: "삼성전자", value: 34.5, amount: "17,674,350원", color: "#2474f2" },
    { label: "SK하이닉스", value: 24.8, amount: "12,705,040원", color: "#22c55e" },
    { label: "NVIDIA", value: 21.2, amount: "10,860,760원", color: "#8b5cf6" },
    { label: "기타", value: 19.5, amount: "9,989,850원", color: "#f79009" }
  ];

  return `
    <div class="stack">
      <section class="metric-grid">
        ${metricCard({
          title: "총자산",
          value: "51,230,000원",
          iconName: "wallet",
          className: "dashboard-metric",
          iconPosition: "end"
        })}
        ${metricCard({
          title: "평가 손익",
          value: "+2,250,000원",
          iconName: "trend",
          tone: "red",
          valueClass: "text-red",
          className: "dashboard-metric",
          iconPosition: "end"
        })}
        ${metricCard({
          title: "수익률",
          value: "+4.59%",
          iconName: "target",
          tone: "red",
          valueClass: "text-red",
          className: "dashboard-metric",
          iconPosition: "end"
        })}
        ${metricCard({
          title: "보유종목 수",
          value: "12개",
          iconName: "wallet",
          tone: "purple",
          className: "dashboard-metric",
          iconPosition: "end"
        })}
      </section>

      <section class="dashboard-grid">
        <article class="panel dashboard-asset-panel">
          <div class="panel-header">
            <h2 class="panel-title">자산 추이</h2>
            <div class="segmented" aria-label="기간 선택">
              <button type="button">1M</button><button type="button">3M</button><button type="button">6M</button>
              <button class="active" type="button">YTD</button><button type="button">1Y</button><button type="button">전체</button>
            </div>
          </div>
          <div class="legend"><span><i class="dot"></i>총자산</span><span><i class="dot gray"></i>투자원금</span><span><i class="dot teal"></i>보유현금</span></div>
          ${lineChart({
            primary: [4930, 4960, 4985, 5015, 4990, 5030, 5055, 5080, 5068, 5105, 5130, 5160, 5110, 5145, 5170, 5123],
            secondary: [4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000],
            tertiary: [930, 920, 910, 895, 920, 902, 890, 875, 884, 872, 860, 850, 868, 885, 902, 898],
            min: 0,
            max: 6000,
            unit: "만원",
            endPrimary: "5,123만원",
            endSecondary: "4,000만원",
            endTertiary: "898만원",
            ariaLabel: "총자산, 투자원금, 보유현금 추이 차트",
            primaryName: "총자산",
            secondaryName: "투자원금",
            tertiaryName: "보유현금",
            tertiaryColor: "#2aa7a1",
            tooltipLabels: ["01/02", "01/12", "01/22", "02/01", "02/11", "02/21", "03/01", "03/11", "03/21", "04/01", "04/11", "04/21", "05/02", "05/12", "05/22", "06/01"],
            className: "dashboard-asset-chart",
            compactViewBox: {
              width: 340,
              height: 320,
              left: 64,
              right: 68,
              top: 16,
              bottom: 42,
              labelFontSize: 12,
              endLabelFontSize: 13,
              primaryStrokeWidth: 3.7,
              secondaryStrokeWidth: 2.5,
              tertiaryStrokeWidth: 2.8,
              pointRadius: 4.5,
              primaryBadgeWidth: 66,
              secondaryBadgeWidth: 62,
              tertiaryBadgeWidth: 62
            }
          })}
        </article>

        <article class="panel">
          <div class="panel-header tight">
            <h2 class="panel-title">포트폴리오 구성</h2>
          </div>
          <div class="donut-row dashboard-portfolio">
            ${donutChart(dashboardPortfolio, "총 자산<br><strong>51,230,000원</strong>")}
            <div class="portfolio-legend">
              ${dashboardPortfolio.map((item) => `
                <div class="legend-row">
                  <span><i class="dot" style="background:${item.color}"></i>${item.label}</span>
                  <strong>${item.value}%</strong>
                </div>
              `).join("")}
            </div>
          </div>
          <p class="footer-note">기준: 평가금액 비중</p>
        </article>
      </section>

      <section class="bottom-grid">
        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">보유 종목 TOP 5</h2>
            <div class="segmented" aria-label="보유 종목 정렬">
              <button class="${dashboardHoldingsView === "amount" ? "active" : ""}" type="button" data-dashboard-holdings-view="amount">금액별</button>
              <button class="${dashboardHoldingsView === "rate" ? "active" : ""}" type="button" data-dashboard-holdings-view="rate">수익률별</button>
            </div>
          </div>
          ${renderTable(["종목명", "수량", "평가금액", "평가손익", "수익률", "비중"], renderDashboardHoldingRows())}
          <p class="footer-note">기준: 전일 종가 / 단위: 원</p>
        </article>

        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">최근 매매 기록</h2>
            <button class="btn ghost" type="button" data-route="journal">더보기 ${icon("chevronRight")}</button>
          </div>
          ${renderTable(["일자", "종목명", "구분", "수량", "체결가", "손익", "수익률"], renderTradeRows(5).map((row) => [row[0], row[1], row[2], row[3], row[4], row[6], row[7]]))}
        </article>
      </section>

      <section class="bottom-grid">
        <article class="panel">
          <div class="list-row">
            <span class="list-icon">${icon("memo")}</span>
            <div>
              <p class="list-title">오늘의 메모</p>
              <p class="list-sub">반도체 섹터 강세 지속. 다음주 FOMC 의사록 발표 주의.</p>
            </div>
            <button class="mini-action" type="button" data-route="memo" aria-label="메모 수정">${icon("edit")}</button>
          </div>
        </article>
        <article class="panel">
          <div class="list-row">
            <span class="list-icon">${icon("star")}</span>
            <div>
              <p class="list-title">오늘의 팁</p>
              <p class="list-sub">손절은 짧게, 익절은 길게 가져가는 것이 장기 수익의 핵심입니다.</p>
            </div>
            <button class="btn ghost" type="button">더 많은 팁 보기 ${icon("chevronRight")}</button>
          </div>
        </article>
      </section>
    </div>
  `;
}
