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

function getDashboardTrendChartMax(values = []) {
  return getDashboardTrendChartScale(values).max;
}

function getDashboardNiceTrendStep(value) {
  const safeValue = Math.max(1, Number(value) || 1);
  const magnitude = 10 ** Math.floor(Math.log10(safeValue));
  const normalized = safeValue / magnitude;
  const niceStep = normalized <= 1
    ? 1
    : normalized <= 2
      ? 2
      : normalized <= 2.5
        ? 2.5
        : normalized <= 5
          ? 5
          : 10;
  return niceStep * magnitude;
}

function getDashboardTrendChartScale(values = []) {
  const numericValues = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0);
  if (!numericValues.length) return { min: 0, max: 100 };

  const maxValue = Math.max(...numericValues);
  if (maxValue <= 0) return { min: 0, max: 100 };

  const minValue = Math.min(...numericValues);
  const rawSpan = Math.max(maxValue - minValue, maxValue * 0.04, 1);
  const paddedMin = Math.max(0, minValue - rawSpan * 0.18);
  const paddedMax = maxValue + rawSpan * 0.18;
  const roughStep = Math.max((paddedMax - paddedMin) / 4, 1);
  const step = getDashboardNiceTrendStep(roughStep);
  const chartMin = Math.max(0, Math.floor(paddedMin / step) * step);
  const chartMax = Math.max(step * 4, Math.ceil(paddedMax / step) * step);

  if (chartMax <= chartMin) {
    return { min: Math.max(0, chartMin - step), max: chartMin + step * 4 };
  }

  return { min: chartMin, max: chartMax };
}

const assetTrendRangeOptions = [
  { key: "1w", label: "1W", days: 7, points: 8 },
  { key: "1m", label: "1M", months: 1, points: 10 },
  { key: "3m", label: "3M", months: 3, points: 12 },
  { key: "6m", label: "6M", months: 6, points: 16 },
  { key: "1y", label: "1Y", months: 12, points: 16 }
];

function getDashboardAssetTrendRangeKey() {
  const selectedRange = typeof getAssetTrendRange === "function" ? getAssetTrendRange() : "1w";
  return assetTrendRangeOptions.some((option) => option.key === selectedRange) ? selectedRange : "1w";
}

function getDashboardAssetTrendRangeOption() {
  const selectedRange = getDashboardAssetTrendRangeKey();
  return assetTrendRangeOptions.find((option) => option.key === selectedRange) || assetTrendRangeOptions[0];
}

function getDashboardStartOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function shiftDashboardDateByMonths(date, monthDelta) {
  const targetMonth = date.getMonth() + monthDelta;
  const target = new Date(date.getFullYear(), targetMonth, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return getDashboardStartOfDay(target);
}

function getDashboardAssetTrendStartDate(option, endDate) {
  if (option.days) {
    const start = new Date(endDate);
    start.setDate(start.getDate() - option.days);
    return getDashboardStartOfDay(start);
  }

  return shiftDashboardDateByMonths(endDate, -option.months);
}

function parseDashboardAssetTrendDate(value = "") {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return getDashboardStartOfDay(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));

  const time = Date.parse(text);
  return Number.isFinite(time) ? getDashboardStartOfDay(new Date(time)) : null;
}

function normalizeDashboardAssetTrendEntry(entry = {}) {
  const date = parseDashboardAssetTrendDate(entry.date || entry.savedAt || entry.updatedAt);
  if (!date) return null;

  return {
    date,
    totalAssets: Math.max(0, Math.round(Number(entry.totalAssets ?? entry.totalValue ?? entry.total ?? 0) || 0)),
    investmentPrincipal: Math.max(0, Math.round(Number(entry.investmentPrincipal ?? entry.principal ?? entry.costBasis ?? 0) || 0)),
    cashBalance: Math.max(0, Math.round(Number(entry.cashBalance ?? entry.cash ?? 0) || 0))
  };
}

function getDashboardAssetTrendEntries() {
  const history = typeof getAssetTrendHistory === "function" ? getAssetTrendHistory() : [];
  const entriesByDate = new Map();

  history
    .map((entry) => normalizeDashboardAssetTrendEntry(entry))
    .filter(Boolean)
    .forEach((entry) => {
      entriesByDate.set(entry.date.getTime(), entry);
    });

  const today = getDashboardStartOfDay(new Date());
  const cashBalance = getAssetCashBalance();
  const totalAssets = getAssetTotalValue();
  const investmentPrincipal = typeof getHoldingTotalCostBasis === "function" ? getHoldingTotalCostBasis() : getAssetInvestedValue();
  entriesByDate.set(today.getTime(), {
    date: today,
    totalAssets,
    investmentPrincipal,
    cashBalance
  });

  return Array.from(entriesByDate.values()).sort((left, right) => left.date.getTime() - right.date.getTime());
}

function buildDashboardAssetTrendSampleDates(startDate, endDate, count) {
  const sampleCount = Math.max(2, Number(count) || 2);
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const span = Math.max(0, endTime - startTime);

  return Array.from({ length: sampleCount }, (_, index) => {
    const time = startTime + (span * index) / (sampleCount - 1);
    return getDashboardStartOfDay(new Date(time));
  });
}

function pickDashboardAssetTrendEntry(entries, sampleDate) {
  let selected = null;
  const sampleTime = sampleDate.getTime();

  for (const entry of entries) {
    if (entry.date.getTime() <= sampleTime) {
      selected = entry;
      continue;
    }
    break;
  }

  return selected || entries[0];
}

function formatDashboardTrendDateLabel(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

function buildDashboardTrendAxisLabels(sampleDates) {
  const labelCount = Math.min(6, sampleDates.length);
  if (labelCount <= 1) return sampleDates.map((date) => formatDashboardTrendDateLabel(date));

  return Array.from({ length: labelCount }, (_, index) => {
    const dateIndex = Math.round((index * (sampleDates.length - 1)) / (labelCount - 1));
    return formatDashboardTrendDateLabel(sampleDates[dateIndex]);
  });
}

function getAssetTrendChartData(targetLines = []) {
  const rangeOption = getDashboardAssetTrendRangeOption();
  const includeCash = typeof getAssetTrendIncludeCash === "function" ? getAssetTrendIncludeCash() : true;
  const endDate = getDashboardStartOfDay(new Date());
  const startDate = getDashboardAssetTrendStartDate(rangeOption, endDate);
  const sampleDates = buildDashboardAssetTrendSampleDates(startDate, endDate, rangeOption.points);
  const entries = getDashboardAssetTrendEntries();
  const sampledEntries = sampleDates.map((sampleDate) => pickDashboardAssetTrendEntry(entries, sampleDate));
  const getPrimaryValue = (entry = {}) => {
    const totalAssets = Number(entry.totalAssets) || 0;
    const cashBalance = Number(entry.cashBalance) || 0;
    return includeCash ? totalAssets : Math.max(0, totalAssets - cashBalance);
  };
  const primaryTrend = sampledEntries.map((entry) => Math.round(getPrimaryValue(entry) / 10000));
  const secondaryTrend = sampledEntries.map((entry) => Math.round((entry?.investmentPrincipal || 0) / 10000));
  const tertiaryTrend = includeCash
    ? sampledEntries.map((entry) => Math.round((entry?.cashBalance || 0) / 10000))
    : null;
  const lastEntry = sampledEntries[sampledEntries.length - 1] || entries[entries.length - 1] || {};
  const totalUnit = Math.round(getPrimaryValue(lastEntry) / 10000);
  const principalUnit = Math.round((lastEntry.investmentPrincipal || 0) / 10000);
  const cashUnit = includeCash ? Math.round((lastEntry.cashBalance || 0) / 10000) : 0;
  const targetValues = targetLines.map((line) => Number(line.value) || 0);
  const visibleTrendValues = [
    ...primaryTrend,
    ...secondaryTrend,
    ...(tertiaryTrend || []),
    ...targetValues
  ];
  const chartScale = getDashboardTrendChartScale(visibleTrendValues);

  return {
    totalUnit,
    principalUnit,
    cashUnit,
    primaryTrend,
    secondaryTrend,
    tertiaryTrend,
    includeCash,
    labels: buildDashboardTrendAxisLabels(sampleDates),
    tooltipLabels: sampleDates.map((date) => formatDashboardTrendDateLabel(date)),
    chartMin: chartScale.min,
    chartMax: chartScale.max
  };
}

function renderAssetTrendChart(options = {}) {
  const { className = "dashboard-asset-chart asset-trend-chart", targetLines = [], compactViewBox = null } = options;
  const trend = getAssetTrendChartData(targetLines);
  const secondaryBadgeOffsetY = trend.totalUnit >= trend.principalUnit ? 18 : -26;
  const defaultCompactViewBox = {
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
    secondaryBadgeOffsetY,
    tertiaryBadgeOffsetY: 6
  };

  return lineChart({
    primary: trend.primaryTrend,
    secondary: trend.secondaryTrend,
    tertiary: trend.tertiaryTrend,
    min: trend.chartMin,
    max: trend.chartMax,
    unit: "만원",
    tickUnit: "",
    endPrimary: formatDashboardChartLabel(trend.totalUnit),
    endSecondary: formatDashboardChartLabel(trend.principalUnit),
    endTertiary: trend.includeCash ? formatDashboardChartLabel(trend.cashUnit) : "",
    ariaLabel: trend.includeCash
      ? "현금 포함 총자산, 투자원금, 보유현금 추이 차트"
      : "현금 제외 총자산, 투자원금 추이 차트",
    primaryName: trend.includeCash ? "총자산" : "총자산(현금 제외)",
    secondaryName: "투자원금",
    tertiaryName: trend.includeCash ? "보유현금" : "",
    tertiaryColor: "#2aa7a1",
    labels: trend.labels,
    tooltipLabels: trend.tooltipLabels,
    className,
    targetLines,
    desktopViewBox: { ...getDashboardAssetDesktopViewBox(), secondaryBadgeOffsetY },
    compactViewBox: compactViewBox || defaultCompactViewBox
  });
}

function renderAssetTrendPanel(options = {}) {
  const {
    className = "dashboard-asset-panel asset-trend-panel",
    title = "자산 추이",
    showTargetSettings = false,
    targetLines = [],
    compactViewBox = null
  } = typeof options === "string" ? { className: options } : options;
  const targetSettingsCompactViewBox = {
    width: 384,
    height: 268,
    left: 38,
    right: 86,
    top: 18,
    bottom: 34,
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
  };
  const panelCompactViewBox = compactViewBox || (showTargetSettings ? targetSettingsCompactViewBox : null);
  const selectedRange = getDashboardAssetTrendRangeKey();
  const includeCash = typeof getAssetTrendIncludeCash === "function" ? getAssetTrendIncludeCash() : true;
  const rangeButtons = assetTrendRangeOptions.map((option) => `
            <button class="${selectedRange === option.key ? "active" : ""}" type="button" data-asset-trend-range="${option.key}" aria-pressed="${selectedRange === option.key ? "true" : "false"}">${option.label}</button>
          `).join("");

  return `
    <article class="panel ${className}">
      <div class="panel-header">
        <h2 class="panel-title">${title}</h2>
        <div class="header-actions asset-trend-actions">
          <div class="segmented" aria-label="기간 선택">
            ${rangeButtons}
          </div>
          ${showTargetSettings ? `<button class="mini-action" type="button" data-modal="assetTrendTargets" aria-label="목표가 설정">${icon("settings")}</button>` : ""}
        </div>
      </div>
      <div class="asset-trend-legend-row">
        <div class="legend">
          <span><i class="dot"></i>총자산</span>
          <span><i class="dot gray"></i>투자원금</span>
          ${includeCash ? `<span><i class="dot teal"></i>보유현금</span>` : ""}
        </div>
        <label class="asset-cash-include-toggle asset-trend-cash-toggle">
          <input type="checkbox" data-asset-trend-cash-toggle ${includeCash ? "checked" : ""}>
          <span>현금 포함</span>
        </label>
      </div>
      ${renderAssetTrendChart({ targetLines, compactViewBox: panelCompactViewBox })}
    </article>
  `;
}

function getDashboardPortfolioSegments(totalAssets, cashBalance) {
  const holdingData = typeof getHoldingData === "function" ? getHoldingData() : [];
  const sortedHoldings = holdingData.slice().sort((a, b) => b.amount - a.amount);
  const topHoldings = sortedHoldings.slice(0, 3);
  const topAmount = topHoldings.reduce((sum, item) => sum + item.amount, 0);
  const otherAmount = Math.max(0, sortedHoldings.reduce((sum, item) => sum + item.amount, 0) - topAmount);
  const segments = topHoldings.map((item, index) => {
    const meta = typeof getAssetHoldingMeta === "function" ? getAssetHoldingMeta(item, index) : null;
    return {
      label: item.name,
      amountValue: item.amount,
      color: meta?.color || (typeof getAssetPortfolioColor === "function" ? getAssetPortfolioColor(30, item.code || item.name || index) : "#2474f2")
    };
  });

  if (otherAmount > 0) {
    segments.push({
      label: "기타",
      amountValue: otherAmount,
      color: typeof getAssetPortfolioColor === "function" ? getAssetPortfolioColor(28, "other") : "#f43f5e"
    });
  }
  if (cashBalance > 0) {
    segments.push({
      label: "현금",
      amountValue: cashBalance,
      color: typeof getAssetPortfolioColor === "function" ? getAssetPortfolioColor(29, "cash") : "#0891b2"
    });
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

function renderDashboardRecentTradeRows(limit = 5) {
  const rows = typeof getAllJournalTradeRows === "function"
    ? getAllJournalTradeRows()
    : (typeof trades !== "undefined" && Array.isArray(trades) ? trades : []);

  return rows
    .slice()
    .sort((a, b) => String(b[10] || b[0] || "").localeCompare(String(a[10] || a[0] || "")))
    .slice(0, limit)
    .map((row) => {
      const isSell = String(row[5] || "").trim() && String(row[5] || "").trim() !== "-";
      const price = isSell ? row[5] : row[4];
      const typeClass = isSell ? "sell" : "buy";
      return [
        row[0],
        row[1],
        `<span class="trade-type ${typeClass}">${row[2]}</span>`,
        row[3],
        price,
        row[6],
        row[7]
      ];
    });
}

function renderDashboardMemoSummary() {
  const [memo] = typeof getUserMemos === "function" ? getUserMemos() : [];
  const title = memo?.title || "저장된 메모가 없습니다.";
  const body = memo?.body || memo?.content || "메모를 작성하면 이 계정의 대시보드에 표시됩니다.";
  const actionLabel = memo ? "메모 수정" : "메모 작성";

  return `
    <article class="panel">
      <div class="list-row">
        <span class="list-icon">${icon("memo")}</span>
        <div>
          <p class="list-title">${escapeHtml(title)}</p>
          <p class="list-sub">${escapeHtml(body)}</p>
        </div>
        <button class="mini-action" type="button" data-route="memo" aria-label="${actionLabel}">${memo ? icon("edit") : icon("plus")}</button>
      </div>
    </article>
  `;
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
          ${renderTable(["일자", "종목명", "구분", "수량", "체결가", "손익", "수익률"], renderDashboardRecentTradeRows(5))}
        </article>
      </section>

      <section class="bottom-grid">
        ${renderDashboardMemoSummary()}
        <article class="panel" hidden>
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
