var assetTrendTargets = [];
var assetTrendTargetDrafts = [];
var assetTrendTargetNextId = 1;

const assetHoldingMeta = {
  "삼성전자": { code: "005930", sector: "IT", badge: "삼성", color: "#2474f2" },
  "SK하이닉스": { code: "000660", sector: "IT", badge: "SK", color: "#f05267" },
  NAVER: { code: "035420", sector: "소비재", badge: "N", color: "#1fcb15" },
  "네이버": { code: "035420", sector: "소비재", badge: "N", color: "#1fcb15" },
  카카오: { code: "035720", sector: "IT", badge: "K", color: "#fbbf24" },
  현대차: { code: "005380", sector: "산업재", badge: "현대", color: "#2356a6" }
};

function createAssetTrendTargetDraft(index = assetTrendTargetDrafts.length) {
  const nextIndex = index + 1;
  return {
    id: `asset-target-${assetTrendTargetNextId++}`,
    label: `목표 ${nextIndex}`,
    amount: 0,
    visible: true
  };
}

function formatAssetTrendTargetAmount(amount) {
  const value = Math.max(0, Math.round(Number(amount) || 0));
  if (value >= 100000000) {
    const eok = Number((value / 100000000).toFixed(2));
    return `${eok.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}억`;
  }
  if (value >= 10000) {
    return `${Math.round(value / 10000).toLocaleString("ko-KR")}만원`;
  }
  return `${value.toLocaleString("ko-KR")}원`;
}

function beginAssetTrendTargetEdit() {
  assetTrendTargetDrafts = assetTrendTargets.length
    ? assetTrendTargets.map((target) => ({ ...target }))
    : [createAssetTrendTargetDraft(0)];
}

function cancelAssetTrendTargetEdit() {
  assetTrendTargetDrafts = [];
}

function addAssetTrendTargetDraft() {
  if (assetTrendTargetDrafts.length >= 5) return;
  assetTrendTargetDrafts.push(createAssetTrendTargetDraft(assetTrendTargetDrafts.length));
}

function removeAssetTrendTargetDraft(targetId) {
  assetTrendTargetDrafts = assetTrendTargetDrafts.filter((target) => target.id !== targetId);
  if (!assetTrendTargetDrafts.length) {
    assetTrendTargetDrafts.push(createAssetTrendTargetDraft(0));
  }
}

function updateAssetTrendTargetDraft(targetId, patch) {
  assetTrendTargetDrafts = assetTrendTargetDrafts.map((target) => (target.id === targetId ? { ...target, ...patch } : target));
}

function applyAssetTrendTargetEdit() {
  assetTrendTargets = assetTrendTargetDrafts
    .map((target, index) => ({
      id: target.id,
      label: String(target.label || "").trim() || `목표 ${index + 1}`,
      amount: Math.max(0, Number(target.amount) || 0),
      visible: Boolean(target.visible)
    }))
    .filter((target) => target.amount > 0)
    .slice(0, 5);
  assetTrendTargetDrafts = [];
}

function getVisibleAssetTrendTargetLines() {
  return assetTrendTargets
    .filter((target) => target.visible && target.amount > 0)
    .slice(0, 5)
    .map((target) => {
      const amount = formatAssetTrendTargetAmount(target.amount);
      return {
        label: `목표가 : ${amount}`,
        value: target.amount / 10000,
        amount,
        tooltip: `목표가: ${amount}`
      };
    });
}

function renderAssetTrendTargetsModal() {
  const drafts = assetTrendTargetDrafts.length ? assetTrendTargetDrafts : [createAssetTrendTargetDraft(0)];

  return `
    <div class="modal-backdrop">
      <section class="modal-panel asset-target-modal" role="dialog" aria-modal="true" aria-labelledby="assetTargetModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Asset Targets</p>
            <h2 class="modal-title" id="assetTargetModalTitle">목표가 설정</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="asset-target-list">
            ${drafts
              .map(
                (target, index) => `
                  <div class="asset-target-row" data-asset-target-row="${target.id}">
                    <label class="asset-target-visible">
                      <input type="checkbox" ${target.visible ? "checked" : ""} data-asset-target-visible data-asset-target-id="${target.id}">
                      <span></span>
                    </label>
                    <div class="asset-target-fields">
                      <div class="field">
                        <label for="assetTargetLabel${index}">목표명</label>
                        <input id="assetTargetLabel${index}" class="input" type="text" value="${escapeChartText(target.label)}" autocomplete="off" data-asset-target-label data-asset-target-id="${target.id}">
                      </div>
                      <div class="field">
                        <label for="assetTargetAmount${index}">목표가</label>
                        <div class="journal-input-shell">
                          <input id="assetTargetAmount${index}" type="text" value="${target.amount ? target.amount.toLocaleString() : ""}" inputmode="numeric" autocomplete="off" placeholder="목표가를 입력하세요" data-number-input data-asset-target-amount data-asset-target-id="${target.id}">
                          <span>원</span>
                        </div>
                      </div>
                    </div>
                    <button class="mini-action asset-target-remove" type="button" data-asset-target-remove="${target.id}" aria-label="목표 삭제">${icon("trash")}</button>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="asset-target-footer">
            <button class="btn ghost" type="button" data-asset-target-add ${drafts.length >= 5 ? "disabled" : ""}>${icon("plus")}목표 추가</button>
            <span>${drafts.length}/5</span>
          </div>
          <div class="asset-cash-actions">
            <button class="btn" type="button" data-modal-close>취소</button>
            <button class="btn primary" type="button" data-asset-target-apply>적용</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function assetMoney(value, className = "") {
  return `<strong class="${className}">${Math.round(Number(value) || 0).toLocaleString()}</strong><span>KRW</span>`;
}

function assetSignedMoney(value) {
  const amount = Math.round(Number(value) || 0);
  const className = amount >= 0 ? "text-red" : "text-blue";
  const sign = amount >= 0 ? "+" : "-";
  return `<strong class="${className}">${sign}${Math.abs(amount).toLocaleString()}</strong><span>KRW</span>`;
}

function assetRate(value) {
  const rate = Number(value) || 0;
  const className = rate >= 0 ? "text-red" : "text-blue";
  const sign = rate >= 0 ? "+" : "-";
  return `<strong class="${className}">${sign}${Math.abs(rate).toFixed(2)}</strong><span>%</span>`;
}

function getAssetHoldingMeta(item, index) {
  const fallbackColor = typeof getAssetPortfolioColor === "function"
    ? getAssetPortfolioColor(30, item.code || item.name || index)
    : "#2474f2";
  const marketLabel = typeof getAssetMarketLabel === "function" ? getAssetMarketLabel(item) : "";
  return assetHoldingMeta[item.name] || {
    code: item.code || "------",
    sector: marketLabel || "자산",
    badge: String(item.name || "?").slice(0, 2),
    color: fallbackColor
  };
}

function renderAssetSummaryMetric(label, valueMarkup, tone = "") {
  return `
    <div class="asset-summary-metric">
      <span>${label}</span>
      <p class="${tone}">${valueMarkup}</p>
    </div>
  `;
}

function renderAssetHoldingRows(holdingData) {
  return holdingData
    .slice()
    .map((item, index) => {
      const meta = getAssetHoldingMeta(item, index);
      const profitClass = item.profit >= 0 ? "text-red" : "text-blue";
      return `
        <tr>
          <td>
            <div class="asset-holding-name">
              <span class="asset-symbol" style="background:${meta.color}">${meta.badge}</span>
              <p><strong>${item.name}</strong><em>${meta.code} · ${meta.sector}</em></p>
            </div>
          </td>
          <td><strong>${formatMarketNumber(item.quantity)}주</strong></td>
          <td><strong>${formatKRW(item.averagePrice)}</strong><em>수정됨</em></td>
          <td><strong>${formatKRW(item.costBasis)}</strong></td>
          <td><strong>${formatKRW(item.currentPrice)}</strong></td>
          <td><strong>${formatKRW(item.amount)}</strong></td>
          <td><strong class="${profitClass}">${formatSignedRate(item.rate)}</strong><em class="${profitClass}">${formatSignedMarketNumber(item.profit)}원</em></td>
          <td><strong>${item.weight.toFixed(1)}%</strong></td>
          <td><button class="btn ghost table-action" type="button">상세</button></td>
        </tr>
      `;
    })
    .join("");
}

function getAssetPortfolioSegments(holdingData, cashBalance = 0, includeCash = true) {
  const sortedHoldings = holdingData.slice().sort((a, b) => b.amount - a.amount);
  const rawSegments = sortedHoldings.map((item, index) => {
    const meta = getAssetHoldingMeta(item, index);
    return {
      label: item.name,
      rawValue: Number(item.amount) || 0,
      amount: formatKRW(item.amount),
      color: meta.color
    };
  }).filter((item) => item.rawValue > 0);

  if (includeCash && Number(cashBalance) > 0) {
    rawSegments.push({
      label: "현금",
      rawValue: Number(cashBalance) || 0,
      amount: formatKRW(cashBalance),
      color: "#ef4444"
    });
  }

  const totalValue = rawSegments.reduce((sum, item) => sum + item.rawValue, 0);
  if (totalValue <= 0) return [];
  return rawSegments.map((item) => ({
    ...item,
    value: totalValue ? Number(((item.rawValue / totalValue) * 100).toFixed(1)) : 0
  }));
}

function getAssetHoldingSegments(holdingData) {
  return getAssetPortfolioSegments(holdingData, 0, false);
}

function renderMobileAssetHoldingCards(holdingData) {
  return holdingData
    .slice()
    .map((item, index) => {
      const meta = getAssetHoldingMeta(item, index);
      const profitClass = item.profit >= 0 ? "text-red" : "text-blue";

      return `
        <article class="asset-mobile-holding-card">
          <div class="asset-mobile-holding-head">
            <h3>${item.name} <span>(${meta.code})</span></h3>
            <div>
              <span>평가손익</span>
              <strong class="${profitClass}">${formatSignedMarketNumber(item.profit)}</strong>
              <span>수익률</span>
              <strong class="${profitClass}">${formatSignedRate(item.rate)}</strong>
            </div>
          </div>
          <div class="asset-mobile-holding-stats">
            <p><strong>${formatMarketNumber(item.quantity)}주</strong><span>보유수량</span></p>
            <p><strong>${formatKRW(item.averagePrice)}</strong><span>매수평균가</span></p>
            <p><strong>${formatKRW(item.amount)}</strong><span>평가금액</span></p>
            <p><strong>${formatKRW(item.costBasis)}</strong><span>매수금액</span></p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderMobileAssets({
  cashBalance,
  totalAssets,
  costBasis,
  investedValue,
  holdingProfit,
  holdingReturn,
  holdingData,
  holdingSegments,
  portfolioIncludeCash = true
}) {
  const profitClass = holdingProfit >= 0 ? "text-red" : "text-blue";
  const visibleSegments = holdingSegments.filter((item) => Number(item.value) > 0).slice(0, 7);
  const visibleWeight = visibleSegments.reduce((sum, item) => sum + item.value, 0);
  const otherWeight = Math.max(0, 100 - visibleSegments.reduce((sum, item) => sum + item.value, 0));
  const mobileSegments = visibleSegments.length && visibleWeight > 0 && otherWeight > 0.05
    ? [...visibleSegments, { label: "기타", value: Number(otherWeight.toFixed(1)), color: "#cbd5e1", amount: "" }]
    : visibleSegments;
  const hasPortfolioSegments = mobileSegments.length > 0;

  return `
    <div class="asset-mobile-page">
      <section class="asset-mobile-summary">
        <div class="asset-mobile-summary-head">
          <h2>내 보유자산 <span>${icon("info")}</span></h2>
          <button class="asset-mobile-settings-button" type="button" data-modal="assetSettings">${icon("settings")}자산 설정</button>
        </div>
        <div class="asset-mobile-summary-hero">
          <div>
            <span>보유 KRW</span>
            <strong>${formatMarketNumber(cashBalance)}</strong>
          </div>
          <div>
            <span>총 보유자산</span>
            <strong>${formatMarketNumber(totalAssets)}</strong>
          </div>
        </div>
        <div class="asset-mobile-summary-grid">
          <span>총 매수</span><strong>${formatMarketNumber(costBasis)}</strong>
          <span>평가손익</span><strong class="${profitClass}">${formatSignedMarketNumber(holdingProfit)}</strong>
          <span>총 평가</span><strong>${formatMarketNumber(investedValue)}</strong>
          <span>수익률</span><strong class="${profitClass}">${formatSignedRate(holdingReturn)}</strong>
          <span>주문가능</span><strong>${formatMarketNumber(cashBalance)}</strong>
        </div>
      </section>

      <section class="asset-mobile-portfolio">
        <div class="asset-mobile-section-head">
          <h2>보유자산 포트폴리오</h2>
          <label class="asset-cash-include-toggle asset-cash-include-toggle-mobile">
            <input type="checkbox" data-asset-portfolio-cash-toggle ${portfolioIncludeCash ? "checked" : ""}>
            <span></span>
            현금 포함
          </label>
        </div>
        <div class="asset-mobile-portfolio-body">
          <div class="asset-mobile-donut">
            ${donutChart(mobileSegments, `보유비중<br><strong>(%)</strong>`)}
          </div>
          <div class="asset-mobile-legend">
            ${hasPortfolioSegments
              ? mobileSegments.map((item) => `
                <div>
                  <span><i class="dot" style="background:${item.color}"></i>${item.label}</span>
                  <strong>${item.value.toFixed(1)}%</strong>
                </div>
              `).join("")
              : `<div class="asset-mobile-legend-empty">보유자산이 없습니다.</div>`}
          </div>
        </div>
      </section>

      <section class="asset-mobile-benefit">
        <div>
          <span>넣어두면 매일 쌓이는 혜택 ${icon("info")}</span>
          <strong>연 2.1% 예치금 이용료 받아요.</strong>
        </div>
        <button class="btn primary" type="button" data-modal="assetCash">+ KRW입금</button>
      </section>

      <label class="asset-mobile-hide-toggle">
        <span></span>
        거래미지원/소액 자산 숨기기
        <i>${icon("info")}</i>
      </label>

      <section class="asset-mobile-holdings">
        ${renderMobileAssetHoldingCards(holdingData)}
      </section>
    </div>
  `;
}

function renderAssets() {
  const cashBalance = getAssetCashBalance();
  const investedValue = getAssetInvestedValue();
  const totalAssets = getAssetTotalValue();
  const holdingData = typeof getHoldingData === "function" ? getHoldingData() : [];
  const cashRatio = totalAssets ? (cashBalance / totalAssets) * 100 : 0;
  const stockRatio = totalAssets ? (investedValue / totalAssets) * 100 : 0;
  const holdingProfit = typeof getHoldingTotalProfit === "function" ? getHoldingTotalProfit() : 0;
  const holdingReturn = typeof getHoldingTotalReturn === "function" ? getHoldingTotalReturn() : 0;
  const dailyChange = typeof getHoldingDailyChange === "function" ? getHoldingDailyChange() : 0;
  const dailyChangeRate = typeof getHoldingDailyChangeRate === "function" ? getHoldingDailyChangeRate() : 0;
  const costBasis = typeof getHoldingTotalCostBasis === "function" ? getHoldingTotalCostBasis() : 0;
  const realizedProfit = 0;
  const allocationDiff = stockRatio - 90;
  const portfolioIncludeCash = typeof getAssetPortfolioIncludeCash === "function" ? getAssetPortfolioIncludeCash() : true;
  const holdingSegments = getAssetPortfolioSegments(holdingData, cashBalance, portfolioIncludeCash);
  const leadingHolding = holdingSegments[0] || { label: "-", value: 0 };
  const hasPortfolioSegments = holdingSegments.length > 0;

  return `
    ${renderMobileAssets({ cashBalance, totalAssets, costBasis, investedValue, holdingProfit, holdingReturn, holdingData, holdingSegments, portfolioIncludeCash })}
    <div class="asset-page asset-desktop-page stack">
      <section class="panel asset-overview-panel">
        <div class="asset-summary-block">
          <div class="asset-section-header">
            <h2 class="panel-title">자산 요약</h2>
            <span>2024.06.20 종가 기준</span>
          </div>
          <div class="asset-summary-grid">
            ${renderAssetSummaryMetric("보유 현금", assetMoney(cashBalance))}
            ${renderAssetSummaryMetric("총 보유자산", assetMoney(totalAssets))}
            ${renderAssetSummaryMetric("총 매수", assetMoney(costBasis))}
            ${renderAssetSummaryMetric("총 평가손익", assetSignedMoney(holdingProfit))}
            ${renderAssetSummaryMetric("주식 평가금", assetMoney(investedValue))}
            ${renderAssetSummaryMetric("총 평가수익률", assetRate(holdingReturn))}
            ${renderAssetSummaryMetric("주문가능", assetMoney(cashBalance))}
            ${renderAssetSummaryMetric("실현손익", assetSignedMoney(realizedProfit))}
          </div>
          <div class="asset-daily-change">
            <span>전일 대비 자산 변동</span>
            <strong class="${dailyChange >= 0 ? "text-red" : "text-blue"}">${formatSignedMarketNumber(dailyChange)}원 (${formatSignedRate(dailyChangeRate)})</strong>
          </div>
        </div>

        <div class="asset-allocation-block">
          <div class="asset-section-header">
            <h2 class="panel-title">보유 자산 구성</h2>
            <div class="asset-allocation-tools">
              <label class="asset-cash-include-toggle">
                <input type="checkbox" data-asset-portfolio-cash-toggle ${portfolioIncludeCash ? "checked" : ""}>
                <span></span>
                현금자산 포함
              </label>
              <button class="mini-action" type="button" aria-label="보유 자산 새로고침">${icon("swap")}</button>
            </div>
          </div>
          <div class="asset-allocation-content">
            <div class="asset-allocation-legend">
              ${hasPortfolioSegments
                ? holdingSegments.map((item) => `
                  <div class="asset-allocation-row">
                    <span><i class="dot" style="background:${item.color}"></i>${item.label}</span>
                    <strong>${item.value.toFixed(1)}%</strong>
                  </div>
                `).join("")
                : `<div class="asset-allocation-empty">보유자산이 없습니다.</div>`}
            </div>
            <div class="asset-donut-wrap">
              ${donutChart(holdingSegments, `보유 자산<br><small>${portfolioIncludeCash ? "현금 포함" : "평가금액"} 기준</small>`)}
            </div>
          </div>
          <div class="asset-allocation-footer">
            <span>기준: ${portfolioIncludeCash ? "현금자산 포함 보유 비중" : "보유 종목 평가금액"}</span>
            <strong>${hasPortfolioSegments ? `최대 비중 ${leadingHolding.label} ${leadingHolding.value.toFixed(1)}%` : "자산을 추가하면 비중이 표시됩니다."}</strong>
          </div>
        </div>
      </section>

      <section class="panel asset-rebalance-banner">
        <span class="status-icon">${icon("swap")}</span>
        <p><strong>목표 비중과 거의 일치합니다.</strong><span>국내 주식 비중이 목표보다 ${Math.abs(allocationDiff).toFixed(1)}%p ${allocationDiff >= 0 ? "높아요" : "낮아요"}.</span></p>
        <button class="btn primary" type="button">리밸런싱 보기</button>
      </section>

      <section class="panel asset-holdings-panel">
        <div class="asset-holdings-header">
          <div class="asset-holdings-title">
            <h2>보유 자산 목록</h2>
            <div class="asset-tabs" role="tablist" aria-label="보유 자산 보기">
              <button class="active" type="button">전체</button>
              <button type="button">계좌별</button>
              <button type="button">섹터별</button>
            </div>
          </div>
          <div class="asset-holdings-actions">
            <button class="btn" type="button">평가 기준&nbsp; 현재가 ${icon("chevronRight")}</button>
            <button class="mini-action" type="button" aria-label="보유 자산 다운로드">${icon("download")}</button>
          </div>
        </div>
        <div class="table-wrap asset-holdings-table-wrap">
          <table class="asset-holdings-table">
            <thead>
              <tr>
                <th>보유자산</th>
                <th>보유수량</th>
                <th>평균단가</th>
                <th>매수금액</th>
                <th>현재가</th>
                <th>평가금액</th>
                <th>평가손익(%)</th>
                <th>비중</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${renderAssetHoldingRows(holdingData)}</tbody>
          </table>
        </div>
        <div class="asset-table-footer">
          <span>※ 종목 데이터는 화면 구성용 샘플입니다.</span>
          <strong>주식 평가금 합계&nbsp; ${formatKRW(investedValue)}</strong>
        </div>
      </section>
    </div>
  `;
}
