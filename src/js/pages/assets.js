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
  const fallbackColors = ["#2474f2", "#f05267", "#22c55e", "#f59e0b", "#2356a6", "#7c3aed"];
  return assetHoldingMeta[item.name] || {
    code: item.code || "------",
    sector: "국내 주식",
    badge: String(item.name || "?").slice(0, 2),
    color: fallbackColors[index % fallbackColors.length]
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
  const realizedProfit = 1250000;
  const allocationDiff = stockRatio - 90;
  const allocationSegments = [
    { label: "국내 주식", value: Number(stockRatio.toFixed(1)), amount: formatKRW(investedValue), color: "#2474f2" },
    { label: "현금", value: Number(cashRatio.toFixed(1)), amount: formatKRW(cashBalance), color: "#f79009" }
  ];

  return `
    <div class="asset-page stack">
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
            <h2 class="panel-title">보유 비중</h2>
            <button class="mini-action" type="button" aria-label="비중 새로고침">${icon("swap")}</button>
          </div>
          <div class="asset-allocation-content">
            <div class="asset-allocation-legend">
              ${allocationSegments.map((item) => `
                <div class="asset-allocation-row">
                  <span><i class="dot" style="background:${item.color}"></i>${item.label}</span>
                  <strong>${item.value.toFixed(1)}%</strong>
                </div>
              `).join("")}
            </div>
            <div class="asset-donut-wrap">
              ${donutChart(allocationSegments, `보유 비중<br><small>현재 평가금액 기준</small>`)}
              <span class="asset-donut-label asset-donut-label-stock">${stockRatio.toFixed(1)}</span>
              <span class="asset-donut-label asset-donut-label-cash">${cashRatio.toFixed(1)}</span>
            </div>
          </div>
          <div class="asset-allocation-footer">
            <span>목표 배분 주식 90% · 현금 10%</span>
            <strong>편차 ${allocationDiff >= 0 ? "+" : ""}${allocationDiff.toFixed(1)}%p</strong>
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
