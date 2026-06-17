var dashboardHoldingsView = "amount";

function parseDashboardNumber(value) {
  return Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
}

function getDashboardAssetDesktopViewBox() {
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1440;

  if (viewportWidth > 1180 && viewportWidth <= 1380) {
    return {
      width: 420,
      height: 270,
      left: 52,
      right: 76,
      top: 20,
      bottom: 36,
      primaryBadgeWidth: 84,
      secondaryBadgeWidth: 80,
      tertiaryBadgeWidth: 68,
      secondaryBadgeOffsetY: -26,
      tertiaryBadgeOffsetY: 6
    };
  }

  if (viewportWidth > 1380 && viewportWidth <= 1680) {
    return {
      width: 560,
      height: 270,
      left: 58,
      right: 76,
      top: 20,
      bottom: 36,
      primaryBadgeWidth: 84,
      secondaryBadgeWidth: 80,
      tertiaryBadgeWidth: 68,
      secondaryBadgeOffsetY: -26,
      tertiaryBadgeOffsetY: 6
    };
  }

  return {
    width: 760,
    height: 270,
    left: 72,
    right: 64,
    top: 22,
    bottom: 36,
    primaryBadgeWidth: 84,
    secondaryBadgeWidth: 80,
    tertiaryBadgeWidth: 68,
    secondaryBadgeOffsetY: -26,
    tertiaryBadgeOffsetY: 6
  };
}

function buildDashboardTrendValues(currentValue, multipliers) {
  return multipliers.map((ratio, index) => {
    if (index === multipliers.length - 1) return currentValue;
    return Math.round(currentValue * ratio);
  });
}

function formatDashboardChartLabel(value) {
  return `${Math.round(value).toLocaleString()}만원`;
}

function getAssetTrendChartData(targetLines = []) {
  const cashBalance = getAssetCashBalance();
  const totalAssets = getAssetTotalValue();
  const investmentPrincipal = typeof getHoldingTotalCostBasis === "function" ? getHoldingTotalCostBasis() : getAssetInvestedValue();
  const totalUnit = Math.round(totalAssets / 10000);
  const principalUnit = Math.round(investmentPrincipal / 10000);
  const cashUnit = Math.round(cashBalance / 10000);
  const primaryTrend = buildDashboardTrendValues(totalUnit, [0.93, 0.94, 0.955, 0.965, 0.96, 0.972, 0.98, 0.988, 0.982, 0.99, 0.996, 1.003, 0.992, 0.998, 1.006, 1]);
  const secondaryTrend = buildDashboardTrendValues(principalUnit, [0.96, 0.965, 0.972, 0.978, 0.982, 0.986, 0.99, 0.993, 0.995, 0.997, 0.998, 0.999, 0.998, 0.999, 1, 1]);
  const tertiaryTrend = buildDashboardTrendValues(cashUnit, [1.08, 1.06, 1.04, 1.02, 1.03, 1.01, 1.0, 0.99, 1.0, 0.98, 0.97, 0.96, 0.98, 0.99, 1.01, 1]);
  const targetValues = targetLines.map((line) => Number(line.value) || 0);
  const chartMax = Math.max(6000, Math.ceil(Math.max(...primaryTrend, ...secondaryTrend, ...tertiaryTrend, ...targetValues) / 1500) * 1500);

  return {
    totalUnit,
    principalUnit,
    cashUnit,
    primaryTrend,
    secondaryTrend,
    tertiaryTrend,
    chartMax
  };
}

function renderAssetTrendChart(options = {}) {
  const { className = "dashboard-asset-chart asset-trend-chart", targetLines = [] } = options;
  const trend = getAssetTrendChartData(targetLines);

  return lineChart({
    primary: trend.primaryTrend,
    secondary: trend.secondaryTrend,
    tertiary: trend.tertiaryTrend,
    min: 0,
    max: trend.chartMax,
    unit: "만원",
    tickUnit: "",
    endPrimary: formatDashboardChartLabel(trend.totalUnit),
    endSecondary: formatDashboardChartLabel(trend.principalUnit),
    endTertiary: formatDashboardChartLabel(trend.cashUnit),
    ariaLabel: "총자산, 투자원금, 보유현금 추이 차트",
    primaryName: "총자산",
    secondaryName: "투자원금",
    tertiaryName: "보유현금",
    tertiaryColor: "#2aa7a1",
    tooltipLabels: ["01/02", "01/12", "01/22", "02/01", "02/11", "02/21", "03/01", "03/11", "03/21", "04/01", "04/11", "04/21", "05/02", "05/12", "05/22", "06/01"],
    className,
    targetLines,
    desktopViewBox: getDashboardAssetDesktopViewBox(),
    compactViewBox: {
      width: 352,
      height: 246,
      left: 40,
      right: 66,
      top: 14,
      bottom: 32,
      labelFontSize: 11,
      endLabelFontSize: 12,
      primaryStrokeWidth: 3.4,
      secondaryStrokeWidth: 2.3,
      tertiaryStrokeWidth: 2.5,
      pointRadius: 4,
      primaryBadgeWidth: 78,
      secondaryBadgeWidth: 76,
      tertiaryBadgeWidth: 62,
      secondaryBadgeOffsetY: -26,
      tertiaryBadgeOffsetY: 6
    }
  });
}

function renderAssetTrendPanel(options = {}) {
  const {
    className = "dashboard-asset-panel asset-trend-panel",
    title = "자산 추이",
    showTargetSettings = false,
    targetLines = []
  } = typeof options === "string" ? { className: options } : options;

  return `
    <article class="panel ${className}">
      <div class="panel-header">
        <h2 class="panel-title">${title}</h2>
        <div class="header-actions asset-trend-actions">
          <div class="segmented" aria-label="기간 선택">
            <button type="button">1M</button><button type="button">3M</button><button class="active" type="button">6M</button>
            <button type="button">1Y</button><button type="button">전체</button>
          </div>
          ${showTargetSettings ? `<button class="mini-action" type="button" data-modal="assetTrendTargets" aria-label="목표가 설정">${icon("settings")}</button>` : ""}
        </div>
      </div>
      <div class="legend"><span><i class="dot"></i>총자산</span><span><i class="dot gray"></i>투자원금</span><span><i class="dot teal"></i>보유현금</span></div>
      ${renderAssetTrendChart({ targetLines })}
    </article>
  `;
}

function getDashboardPortfolioSegments(totalAssets, cashBalance) {
  const colors = ["#2474f2", "#22c55e", "#8b5cf6", "#f79009", "#0ea5e9"];
  const holdingData = typeof getHoldingData === "function" ? getHoldingData() : [];
  const sortedHoldings = holdingData.slice().sort((a, b) => b.amount - a.amount);
  const topHoldings = sortedHoldings.slice(0, 3);
  const topAmount = topHoldings.reduce((sum, item) => sum + item.amount, 0);
  const otherAmount = Math.max(0, sortedHoldings.reduce((sum, item) => sum + item.amount, 0) - topAmount);
  const segments = topHoldings.map((item, index) => ({
    label: item.name,
    amountValue: item.amount,
    color: colors[index]
  }));

  if (otherAmount > 0) {
    segments.push({ label: "기타", amountValue: otherAmount, color: colors[3] });
  }
  if (cashBalance > 0) {
    segments.push({ label: "현금", amountValue: cashBalance, color: colors[4] });
  }

  return segments.map((item) => ({
    ...item,
    value: totalAssets ? Number(((item.amountValue / totalAssets) * 100).toFixed(1)) : 0,
    amount: formatKRW(item.amountValue)
  }));
}

function renderDashboardHoldingRows() {
  const sortIndex = dashboardHoldingsView === "rate" ? 4 : 2;
  const rows = typeof getHoldingRows === "function" ? getHoldingRows() : holdings;

  return rows
    .slice()
    .sort((a, b) => parseDashboardNumber(b[sortIndex]) - parseDashboardNumber(a[sortIndex]))
    .slice(0, 5)
    .map((row) =>
      row.map((cell, index) => {
        if (index !== 3 && index !== 4) return cell;
        const colorClass = cell.startsWith("+") ? "text-red" : cell.startsWith("-") ? "text-blue" : "";
        return `<span class="${colorClass}">${cell}</span>`;
      })
    );
}

function renderDashboard() {
  const cashBalance = getAssetCashBalance();
  const totalAssets = getAssetTotalValue();
  const holdingProfit = typeof getHoldingTotalProfit === "function" ? getHoldingTotalProfit() : 0;
  const holdingReturn = typeof getHoldingTotalReturn === "function" ? getHoldingTotalReturn() : 0;
  const profitClass = holdingProfit >= 0 ? "text-red" : "text-blue";
  const dashboardPortfolio = getDashboardPortfolioSegments(totalAssets, cashBalance);

  return `
    <div class="stack">
      <section class="metric-grid">
        ${metricCard({
          title: "총자산",
          value: formatKRW(totalAssets),
          iconName: "wallet",
          className: "dashboard-metric",
          iconPosition: "end"
        })}
        ${metricCard({
          title: "보유 현금",
          value: formatKRW(cashBalance),
          iconName: "coin",
          tone: "green",
          className: "dashboard-metric",
          iconPosition: "end"
        })}
        ${metricCard({
          title: "평가 손익",
          value: `${formatSignedMarketNumber(holdingProfit)}원`,
          iconName: "trend",
          tone: holdingProfit >= 0 ? "red" : "blue",
          valueClass: profitClass,
          className: "dashboard-metric",
          iconPosition: "end"
        })}
        ${metricCard({
          title: "수익률",
          value: formatSignedRate(holdingReturn),
          iconName: "target",
          tone: holdingReturn >= 0 ? "red" : "blue",
          valueClass: holdingReturn >= 0 ? "text-red" : "text-blue",
          className: "dashboard-metric",
          iconPosition: "end"
        })}
      </section>

      <section class="dashboard-grid">
        ${renderAssetTrendPanel()}

        <article class="panel">
          <div class="panel-header tight">
            <h2 class="panel-title">포트폴리오 구성</h2>
          </div>
          <div class="donut-row dashboard-portfolio">
            ${donutChart(dashboardPortfolio, `총 자산<br><strong>${formatKRW(totalAssets)}</strong>`)}
            <div class="portfolio-legend">
              ${dashboardPortfolio.map((item) => `
                <div class="legend-row">
                  <span><i class="dot" style="background:${item.color}"></i>${item.label}</span>
                  <strong>${item.value}%</strong>
                </div>
              `).join("")}
            </div>
          </div>
          <p class="footer-note">기준: 평가금액 및 현금 비중</p>
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
          <p class="footer-note">기준: 네이버 증권 장마감 현재가 / 단위: 원</p>
        </article>

        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">최근 매매 기록</h2>
            <button class="btn ghost dashboard-more-btn" type="button" data-route="journal">더보기 ${icon("chevronRight")}</button>
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
