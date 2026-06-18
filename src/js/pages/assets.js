var assetTrendTargets = [];
var assetTrendTargetDrafts = [];
var assetTrendTargetNextId = 1;

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

function renderAssets() {
  const cashBalance = getAssetCashBalance();
  const investedValue = getAssetInvestedValue();
  const totalAssets = getAssetTotalValue();
  const cashRatio = totalAssets ? (cashBalance / totalAssets) * 100 : 0;
  const stockRatio = totalAssets ? (investedValue / totalAssets) * 100 : 0;
  const holdingProfit = typeof getHoldingTotalProfit === "function" ? getHoldingTotalProfit() : 0;
  const holdingReturn = typeof getHoldingTotalReturn === "function" ? getHoldingTotalReturn() : 0;
  const dailyChange = typeof getHoldingDailyChange === "function" ? getHoldingDailyChange() : 0;
  const dailyChangeRate = typeof getHoldingDailyChangeRate === "function" ? getHoldingDailyChangeRate() : 0;
  const profitClass = holdingProfit >= 0 ? "text-red" : "text-blue";
  const dailyClass = dailyChange >= 0 ? "text-red" : "text-blue";
  const holdingDetailRows = (typeof getHoldingDetailRows === "function" ? getHoldingDetailRows() : []).map((row) =>
    row.map((cell, index) => {
      if (index !== 4 && index !== 5) return cell;
      const colorClass = cell.startsWith("+") ? "text-red" : cell.startsWith("-") ? "text-blue" : "";
      return `<span class="${colorClass}">${cell}</span>`;
    })
  );
  const portfolioSegments = [
    { label: "국내 주식", amountValue: investedValue, color: "#2474f2" },
    { label: "현금", amountValue: cashBalance, color: "#f79009" }
  ].map((item) => ({
    ...item,
    value: totalAssets ? Number(((item.amountValue / totalAssets) * 100).toFixed(1)) : 0,
    amount: formatKRW(item.amountValue)
  }));
  return `
    <div class="stack">
      <section class="metric-grid">
        ${metricCard({ title: "총자산", value: formatKRW(totalAssets), sub: `<span>전일 대비</span><strong class="${dailyClass}">${formatSignedMarketNumber(dailyChange)}원 (${formatSignedRate(dailyChangeRate)})</strong>`, iconName: "wallet", info: true, className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
        ${metricCard({ title: "현금비중", value: `${cashRatio.toFixed(1)}%`, sub: `<span>${formatKRW(cashBalance)}</span>`, iconName: "coin", className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
        ${metricCard({ title: "평가손익", value: `${formatSignedMarketNumber(holdingProfit)}원`, sub: `<strong class="${profitClass}">${formatSignedRate(holdingReturn)}</strong>`, iconName: "trend", tone: holdingProfit >= 0 ? "red" : "blue", valueClass: profitClass, className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
        ${metricCard({ title: "실현손익", value: "+1,250,000원", sub: `<strong class="text-red">+3.21%</strong>`, iconName: "target", tone: "red", valueClass: "text-red", className: "dashboard-metric page-summary-metric", iconPosition: "end" })}
      </section>

      <section class="asset-grid">
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">포트폴리오 구성</h2></div>
          <div class="donut-row">
            ${donutChart(portfolioSegments, `총 자산<br><strong>${formatKRW(totalAssets)}</strong>`)}
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
              ["국내 주식", "90%", `${stockRatio.toFixed(1)}%`, stockRatio, "#2474f2"],
              ["현금", "10%", `${cashRatio.toFixed(1)}%`, cashRatio, "#f79009"]
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
            <div class="list-row"><span class="list-icon">${icon("wallet")}</span><div><p class="list-title">주식 계좌</p><p class="list-sub">${formatSignedRate(holdingReturn)}</p></div><strong>${formatKRW(investedValue)}</strong></div>
            <div class="list-row"><span class="list-icon" style="color:var(--purple);background:var(--purple-soft)">${icon("wallet")}</span><div><p class="list-title">현금 계좌</p><p class="list-sub">입출금 반영</p></div><strong>${formatKRW(cashBalance)}</strong></div>
          </div>
        </article>
        ${renderAssetTrendPanel({ title: "종합 자산 추이", showTargetSettings: true, targetLines: getVisibleAssetTrendTargetLines() })}
        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">주식 vs 현금 비중</h2></div>
          <div class="donut-row asset-compact-donut">
            ${donutChart([{ label: "주식", value: Number(stockRatio.toFixed(1)), color: "#2474f2" }, { label: "현금", value: Number(cashRatio.toFixed(1)), color: "#f79009" }], "", true)}
            <div class="portfolio-legend">
              <div class="legend-row"><span><i class="dot"></i>주식</span><strong>${stockRatio.toFixed(1)}%</strong></div>
              <div class="legend-row"><span><i class="dot" style="background:#f79009"></i>현금</span><strong>${cashRatio.toFixed(1)}%</strong></div>
            </div>
          </div>
          <p class="footer-note">기준: 현재 평가금액</p>
        </article>
      </section>

      <section class="journal-layout">
        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">보유 종목 상세</h2>
            <div class="header-actions"><span class="tiny">평가 기준</span><select class="select" style="width:120px"><option>현재가</option></select><button class="mini-action" type="button">${icon("download")}</button></div>
          </div>
          ${renderTable(["종목명", "수량", "평균단가", "현재가", "평가손익", "수익률", "비중"], holdingDetailRows)}
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
